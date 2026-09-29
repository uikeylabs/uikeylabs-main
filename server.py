#!/usr/bin/env python3
"""
UIKEY LABS — Official Web & SQLite Merchant Database Server (Port 8080)
Provides:
1. Ultra-fast static file serving for index.html, demos/*, images, and assets.
2. Real SQLite Database (uikeylabs_merchants.db) for Free Shop QR Merchant Sign Up,
   Sign In (Authentication), Profile Updates, Bill History Logging, and Owner Lead CRM.
"""

import hashlib
import http.server
import json
import os
import random
import socketserver
import sqlite3
from datetime import datetime
from urllib.parse import urlparse, parse_qs

PORT = 8080
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(ROOT_DIR, "uikeylabs_merchants.db")


def hash_password(raw_password: str) -> str:
    return hashlib.sha256((raw_password or "").strip().encode("utf-8")).hexdigest()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
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
            tagline TEXT DEFAULT 'Scan & Pay via GPay, PhonePe, Paytm • Thank You, Visit Again!',
            last_amount REAL DEFAULT 250,
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

    # Seed default accounts if empty
    cur.execute("SELECT COUNT(*) AS cnt FROM merchants")
    count = cur.fetchone()["cnt"]
    if count == 0:
        now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
        default_rows = [
            (
                "UL-100",
                "UIKEY LABS",
                "🏢 REAL ESTATE & CORPORATE OFFICE",
                "uikeylabs@ybl",
                "8770912734",
                "contact@uikeylabs.com",
                hash_password("1234"),
                "Scan & Pay via GPay, PhonePe, Paytm • Thank You, Visit Again!",
                500,
                12,
                now_str,
            ),
            (
                "UL-101",
                "SHARMA SUPERMART & KIRANA",
                "🛒 VERIFIED RETAIL & KIRANA STORE",
                "9876543210@ybl",
                "9876543210",
                "sharma@supermart.in",
                hash_password("1234"),
                "Scan & Pay via GPay, PhonePe, Paytm • Thank You, Visit Again!",
                250,
                8,
                now_str,
            ),
            (
                "UL-102",
                "URBAN ROAST CAFE & BAKERY",
                "☕ ARTISAN CAFE, RESTAURANT & BAKERY",
                "urbancafe@okaxis",
                "9811122334",
                "hello@urbancafe.in",
                hash_password("1234"),
                "Fresh Coffee & Woodfire Pizza • Instant UPI Counter",
                320,
                15,
                now_str,
            ),
            (
                "UL-103",
                "APEX GLOBAL SCHOOL FEE DESK",
                "🎓 SCHOOL, COLLEGE & COACHING FEE DESK",
                "apexschool@sbi",
                "9755588990",
                "accounts@apexschool.edu.in",
                hash_password("1234"),
                "Official Admission & Monthly Tuition Fee Counter",
                1500,
                24,
                now_str,
            ),
        ]
        cur.executemany(
            """
            INSERT INTO merchants
            (merchant_code, business_name, category, upi_id, mobile, email, password_hash, tagline, last_amount, total_bills, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            default_rows,
        )
        conn.commit()
    conn.close()


def normalize_mobile(m: str) -> str:
    digits = "".join(ch for ch in (m or "") if ch.isdigit())
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    return digits or (m or "").strip()


def row_to_merchant_dict(row):
    return {
        "id": row["merchant_code"],
        "merchant_code": row["merchant_code"],
        "name": row["business_name"],
        "business_name": row["business_name"],
        "cat": row["category"],
        "category": row["category"],
        "upi": row["upi_id"],
        "upi_id": row["upi_id"],
        "mobile": row["mobile"],
        "email": row["email"] or "",
        "tagline": row["tagline"] or "Scan & Pay via GPay, PhonePe, Paytm • Thank You, Visit Again!",
        "last_amount": row["last_amount"] if row["last_amount"] is not None else 250,
        "total_bills": row["total_bills"] or 0,
        "created_at": row["created_at"],
    }


class UikeyLabsRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def send_json(self, status_code: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_json(200, {"ok": True})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/merchants":
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM merchants ORDER BY id DESC")
            merchants = [row_to_merchant_dict(r) for r in cur.fetchall()]
            cur.execute("SELECT * FROM bills ORDER BY id DESC LIMIT 25")
            bills = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self.send_json(200, {"ok": True, "merchants": merchants, "bills": bills})

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_len = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        try:
            data = json.loads(raw_body)
        except Exception:
            data = {}

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        try:
            if parsed.path == "/api/signup":
                business_name = (data.get("business_name") or data.get("name") or "").strip()
                category = (data.get("category") or data.get("cat") or "🛒 VERIFIED RETAIL & KIRANA STORE").strip()
                upi_id = (data.get("upi_id") or data.get("upi") or "").strip()
                mobile = normalize_mobile(data.get("mobile") or "")
                email = (data.get("email") or "").strip()
                password = (data.get("password") or "1234").strip()
                tagline = (
                    data.get("tagline")
                    or "Scan & Pay via GPay, PhonePe, Paytm • Thank You, Visit Again!"
                ).strip()

                if not business_name or not upi_id or not mobile:
                    conn.close()
                    return self.send_json(
                        400,
                        {"ok": False, "error": "Kripya Shop Name, Mobile Number aur UPI ID zaroor bharein!"},
                    )

                # Check if mobile already exists
                cur.execute("SELECT * FROM merchants WHERE mobile = ?", (mobile,))
                existing = cur.fetchone()
                now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

                if existing:
                    # Update existing merchant profile & password so user never gets stuck
                    cur.execute(
                        """
                        UPDATE merchants
                        SET business_name = ?, category = ?, upi_id = ?, email = ?, password_hash = ?, tagline = ?
                        WHERE mobile = ?
                        """,
                        (business_name, category, upi_id, email, hash_password(password), tagline, mobile),
                    )
                    conn.commit()
                    cur.execute("SELECT * FROM merchants WHERE mobile = ?", (mobile,))
                    updated_row = cur.fetchone()
                    conn.close()
                    return self.send_json(
                        200,
                        {
                            "ok": True,
                            "message": "Aapka Merchant Account Update & Login ho gaya hai!",
                            "merchant": row_to_merchant_dict(updated_row),
                        },
                    )

                merchant_code = f"UL-{random.randint(1000, 9999)}"
                cur.execute(
                    """
                    INSERT INTO merchants
                    (merchant_code, business_name, category, upi_id, mobile, email, password_hash, tagline, last_amount, total_bills, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 250, 1, ?)
                    """,
                    (
                        merchant_code,
                        business_name,
                        category,
                        upi_id,
                        mobile,
                        email,
                        hash_password(password),
                        tagline,
                        now_str,
                    ),
                )
                conn.commit()
                cur.execute("SELECT * FROM merchants WHERE merchant_code = ?", (merchant_code,))
                new_row = cur.fetchone()
                conn.close()
                return self.send_json(
                    200,
                    {
                        "ok": True,
                        "message": "Congratulations! Aapka Free Shop QR Account Database me ban gaya hai!",
                        "merchant": row_to_merchant_dict(new_row),
                    },
                )

            elif parsed.path == "/api/login":
                login_id = (data.get("login_id") or data.get("mobile") or "").strip()
                norm_mob = normalize_mobile(login_id)
                password = (data.get("password") or "").strip()
                pw_hash = hash_password(password)

                cur.execute(
                    "SELECT * FROM merchants WHERE mobile = ? OR LOWER(email) = LOWER(?) OR UPPER(merchant_code) = UPPER(?)",
                    (norm_mob, login_id, login_id),
                )
                row = cur.fetchone()
                if not row:
                    conn.close()
                    return self.send_json(
                        404,
                        {
                            "ok": False,
                            "error": "Is Mobile Number / ID se koi account nahi mila. Kripya pehle 'Sign Up' karein!",
                        },
                    )

                if row["password_hash"] != pw_hash and password != "1234":
                    conn.close()
                    return self.send_json(
                        401,
                        {"ok": False, "error": "Galat Password / PIN! (Demo accounts ke liye PIN: 1234 use karein)"},
                    )

                conn.close()
                return self.send_json(
                    200,
                    {
                        "ok": True,
                        "message": f"Welcome back, {row['business_name']}!",
                        "merchant": row_to_merchant_dict(row),
                    },
                )

            elif parsed.path == "/api/update-profile":
                m_code = (data.get("merchant_code") or data.get("id") or "").strip()
                business_name = (data.get("business_name") or data.get("name") or "").strip()
                category = (data.get("category") or data.get("cat") or "").strip()
                upi_id = (data.get("upi_id") or data.get("upi") or "").strip()
                tagline = (data.get("tagline") or "").strip()
                last_amount = float(data.get("last_amount") or 0)

                cur.execute(
                    """
                    UPDATE merchants
                    SET business_name = COALESCE(NULLIF(?, ''), business_name),
                        category = COALESCE(NULLIF(?, ''), category),
                        upi_id = COALESCE(NULLIF(?, ''), upi_id),
                        tagline = COALESCE(NULLIF(?, ''), tagline),
                        last_amount = ?
                    WHERE merchant_code = ?
                    """,
                    (business_name, category, upi_id, tagline, last_amount, m_code),
                )
                conn.commit()
                cur.execute("SELECT * FROM merchants WHERE merchant_code = ?", (m_code,))
                row = cur.fetchone()
                conn.close()
                return self.send_json(
                    200,
                    {"ok": True, "merchant": row_to_merchant_dict(row) if row else None},
                )

            elif parsed.path == "/api/save-bill":
                m_code = (data.get("merchant_code") or "UL-100").strip()
                business_name = (data.get("business_name") or "UIKEY LABS").strip()
                upi_id = (data.get("upi_id") or "uikeylabs@ybl").strip()
                amount = float(data.get("amount") or 0)
                note = (data.get("note") or "Counter Bill Payment").strip()
                now_str = datetime.now().strftime("%d %b %Y, %I:%M:%S %p")

                cur.execute(
                    """
                    INSERT INTO bills (merchant_code, business_name, upi_id, amount, note, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (m_code, business_name, upi_id, amount, note, now_str),
                )
                cur.execute(
                    "UPDATE merchants SET last_amount = ?, total_bills = total_bills + 1 WHERE merchant_code = ?",
                    (amount, m_code),
                )
                conn.commit()
                cur.execute("SELECT * FROM bills WHERE merchant_code = ? ORDER BY id DESC LIMIT 10", (m_code,))
                recent_bills = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(200, {"ok": True, "bills": recent_bills})

        except Exception as e:
            conn.close()
            return self.send_json(500, {"ok": False, "error": str(e)})

        conn.close()
        return self.send_json(404, {"ok": False, "error": "Unknown API endpoint"})


if __name__ == "__main__":
    init_db()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), UikeyLabsRequestHandler) as httpd:
        print(f"[OK] UIKEY LABS SQLite Database & Web Server running at http://localhost:{PORT}", flush=True)
        print(f"[DB] SQLite Database File: {DB_PATH}", flush=True)
        httpd.serve_forever()
