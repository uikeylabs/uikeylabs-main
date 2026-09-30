#!/usr/bin/env python3
"""
UIKEY LABS — Production Web & Authenticated API Server (Port 8080)
Security Features Implemented (Phase 4):
1. PBKDF2-HMAC-SHA256 salted password hashing (120,000 iterations) + constant-time hmac.compare_digest.
2. Zero hardcoded PINs (no '1234') and zero fake/sample customer records seeded.
3. IP-based Rate Limiting & Brute-Force Login Protection (max 5 failed attempts per 300s window).
4. Server-side validation for UPI IDs, 10-digit Indian mobile numbers, milestone amounts, and 12-digit UTRs.
5. Session Token Authorization required for protected endpoints (/api/merchants).
6. Security HTTP Headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
"""

import hashlib
import hmac
import http.server
import json
import os
import re
import secrets
import socketserver
import sqlite3
import time
from datetime import datetime
from urllib.parse import urlparse

PORT = int(os.environ.get("PORT", "8080"))
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("SQLITE_DB_PATH", os.path.join(ROOT_DIR, "uikeylabs_merchants.db"))

UPI_REGEX = re.compile(r"^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$")
UTR_REGEX = re.compile(r"^[0-9]{12}$")
ALLOWED_MILESTONE_AMOUNTS = {2500, 4999, 5000, 9999, 19999}

# In-memory rate limiter & authenticated session store
LOGIN_ATTEMPTS = {}  # ip -> [timestamps]
ACTIVE_SESSIONS = {}  # token -> (merchant_code, expiry_ts)
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_WINDOW_SEC = 300
SESSION_TTL_SEC = 3600


def hash_password(raw_password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", raw_password.encode("utf-8"), salt, 120000)
    return f"pbkdf2_sha256$120000${salt.hex()}${dk.hex()}"


def verify_password(raw_password: str, stored_hash: str) -> bool:
    if not raw_password or not stored_hash:
        return False
    if stored_hash.startswith("pbkdf2_sha256$"):
        try:
            _, iter_str, salt_hex, hash_hex = stored_hash.split("$", 3)
            salt = bytes.fromhex(salt_hex)
            expected = bytes.fromhex(hash_hex)
            candidate = hashlib.pbkdf2_hmac("sha256", raw_password.encode("utf-8"), salt, int(iter_str))
            return hmac.compare_digest(candidate, expected)
        except Exception:
            return False
    # Legacy sha256 fallback migration check
    legacy_candidate = hashlib.sha256(raw_password.strip().encode("utf-8")).hexdigest()
    return hmac.compare_digest(legacy_candidate, stored_hash)


def is_rate_limited(client_ip: str) -> bool:
    now = time.time()
    history = [ts for ts in LOGIN_ATTEMPTS.get(client_ip, []) if now - ts < LOCKOUT_WINDOW_SEC]
    LOGIN_ATTEMPTS[client_ip] = history
    return len(history) >= MAX_LOGIN_ATTEMPTS


def record_failed_login(client_ip: str) -> None:
    now = time.time()
    history = [ts for ts in LOGIN_ATTEMPTS.get(client_ip, []) if now - ts < LOCKOUT_WINDOW_SEC]
    history.append(now)
    LOGIN_ATTEMPTS[client_ip] = history


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS merchants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant_code TEXT UNIQUE NOT NULL,
            business_name TEXT NOT NULL,
            category TEXT NOT NULL,
            upi_id TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            email TEXT DEFAULT '',
            password_hash TEXT NOT NULL,
            tagline TEXT DEFAULT 'Scan & Pay via UPI • Thank You!',
            last_amount REAL DEFAULT 0,
            total_bills INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant_code TEXT NOT NULL,
            business_name TEXT NOT NULL,
            upi_id TEXT NOT NULL,
            amount REAL NOT NULL,
            note TEXT DEFAULT 'Counter Bill Payment',
            created_at TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name TEXT NOT NULL,
            industry TEXT NOT NULL,
            mobile TEXT NOT NULL,
            city TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS payment_verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name TEXT NOT NULL,
            amount INTEGER NOT NULL,
            utr TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'PENDING_VERIFICATION',
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def normalize_mobile(m: str) -> str:
    digits = "".join(ch for ch in (m or "") if ch.isdigit())
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    return digits[-10:] if len(digits) >= 10 else ""


def sanitize_merchant_row(row):
    return {
        "merchant_code": row["merchant_code"],
        "business_name": row["business_name"],
        "category": row["category"],
        "upi_id": row["upi_id"],
        "mobile": row["mobile"],
        "tagline": row["tagline"] or "",
        "last_amount": row["last_amount"] or 0,
        "created_at": row["created_at"],
    }


class UikeyLabsRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def send_json(self, status_code: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        clean_routes = {
            "/merchant-qr": "/merchant-qr.html",
            "/payment": "/payment.html",
            "/quote": "/quote.html",
            "/dashboard": "/dashboard.html",
            "/legal": "/legal.html",
        }
        if parsed.path in clean_routes:
            self.path = clean_routes[parsed.path]
            return super().do_GET()

        if parsed.path == "/api/merchants":
            auth_hdr = self.headers.get("Authorization", "")
            token = auth_hdr.replace("Bearer ", "").strip()
            session = ACTIVE_SESSIONS.get(token)
            if not session or session[1] < time.time():
                return self.send_json(401, {"ok": False, "error": "Unauthorized. Please sign in first."})

            merchant_code = session[0]
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM merchants WHERE merchant_code = ?", (merchant_code,))
            row = cur.fetchone()
            conn.close()
            if not row:
                return self.send_json(404, {"ok": False, "error": "Account not found."})
            return self.send_json(200, {"ok": True, "merchant": sanitize_merchant_row(row)})

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        client_ip = self.client_address[0] if self.client_address else "unknown"
        content_len = min(int(self.headers.get("Content-Length", 0)), 32768)
        raw_body = self.rfile.read(content_len).decode("utf-8", errors="replace") if content_len > 0 else "{}"
        try:
            data = json.loads(raw_body)
        except Exception:
            return self.send_json(400, {"ok": False, "error": "Invalid JSON request payload."})

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        try:
            if parsed.path == "/api/lead":
                biz = (data.get("business_name") or "").strip()[:120]
                ind = (data.get("industry") or "Local Business").strip()[:80]
                mob = normalize_mobile(data.get("mobile") or "")
                city = (data.get("city") or "").strip()[:80]
                if not biz or not mob:
                    conn.close()
                    return self.send_json(400, {"ok": False, "error": "Business name and 10-digit mobile required."})
                cur.execute(
                    "INSERT INTO leads (business_name, industry, mobile, city, created_at) VALUES (?, ?, ?, ?, ?)",
                    (biz, ind, mob, city, datetime.now().isoformat()),
                )
                conn.commit()
                conn.close()
                return self.send_json(200, {"ok": True, "message": "Consultation lead saved."})

            if parsed.path == "/api/verify-payment":
                biz = (data.get("business_name") or "").strip()[:120]
                amt = int(data.get("amount") or 0)
                utr = (data.get("utr") or "").strip()
                if not biz or amt not in ALLOWED_MILESTONE_AMOUNTS or not UTR_REGEX.match(utr):
                    conn.close()
                    return self.send_json(
                        400,
                        {"ok": False, "error": "Invalid milestone amount or 12-digit UTR number."},
                    )
                cur.execute(
                    "INSERT OR IGNORE INTO payment_verifications (business_name, amount, utr, created_at) VALUES (?, ?, ?, ?)",
                    (biz, amt, utr, datetime.now().isoformat()),
                )
                conn.commit()
                conn.close()
                return self.send_json(
                    200,
                    {"ok": True, "message": "UTR logged for backend bank statement verification."},
                )

            if parsed.path == "/api/signup":
                business_name = (data.get("business_name") or "").strip()[:120]
                category = (data.get("category") or "Retail").strip()[:80]
                upi_id = (data.get("upi_id") or "").strip()[:120]
                mobile = normalize_mobile(data.get("mobile") or "")
                password = (data.get("password") or "").strip()

                if not business_name or not mobile or not UPI_REGEX.match(upi_id) or len(password) < 6:
                    conn.close()
                    return self.send_json(
                        400,
                        {
                            "ok": False,
                            "error": "Valid business name, 10-digit mobile, valid UPI ID, and minimum 6-character password required.",
                        },
                    )

                code = f"UL-{secrets.randbelow(9000) + 1000}"
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute(
                    """
                    INSERT INTO merchants (merchant_code, business_name, category, upi_id, mobile, password_hash, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (code, business_name, category, upi_id, mobile, hash_password(password), now_str),
                )
                conn.commit()
                conn.close()
                return self.send_json(201, {"ok": True, "merchant_code": code})

            if parsed.path == "/api/login":
                if is_rate_limited(client_ip):
                    conn.close()
                    return self.send_json(
                        429,
                        {"ok": False, "error": "Too many failed login attempts. Please wait 5 minutes."},
                    )

                login_id = (data.get("login_id") or "").strip()
                password = data.get("password") or ""
                norm_mob = normalize_mobile(login_id)

                cur.execute(
                    "SELECT * FROM merchants WHERE mobile = ? OR UPPER(merchant_code) = ?",
                    (norm_mob or login_id, login_id.upper()),
                )
                row = cur.fetchone()
                conn.close()

                if not row or not verify_password(password, row["password_hash"]):
                    record_failed_login(client_ip)
                    return self.send_json(401, {"ok": False, "error": "Invalid login ID or password."})

                token = secrets.token_urlsafe(32)
                ACTIVE_SESSIONS[token] = (row["merchant_code"], time.time() + SESSION_TTL_SEC)
                return self.send_json(
                    200,
                    {"ok": True, "session_token": token, "merchant": sanitize_merchant_row(row)},
                )

            conn.close()
            return self.send_json(404, {"ok": False, "error": "API endpoint not found."})
        except Exception:
            conn.close()
            return self.send_json(500, {"ok": False, "error": "Unable to process request at this time."})


if __name__ == "__main__":
    init_db()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), UikeyLabsRequestHandler) as httpd:
        print(f"UIKEY LABS Production Server running on http://localhost:{PORT}")
        httpd.serve_forever()
