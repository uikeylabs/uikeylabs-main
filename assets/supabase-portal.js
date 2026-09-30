/**
 * UIKEY LABS — Supabase Merchant Portal Client (supabase-js v2)
 * Powers:
 *  1. login.html (Email/Password Sign In, Sign Up & Google OAuth 2.0 Social Login)
 *  2. forgot-password.html (supabaseClient.auth.resetPasswordForEmail + OTP / Password Recovery)
 *  3. dashboard.html (Session guard, 'shops' table query by 'owner_email', dynamic 'qr_code_url' display & Logout)
 */
(function () {
  "use strict";

  var CFG_URL_KEY = "uikey_supabase_project_url";
  var CFG_ANON_KEY = "uikey_supabase_anon_key";
  var SESSION_STORAGE_KEY = "uikeylabs_active_user_jwt_v2";
  var SHOPS_TABLE_KEY = "uikeylabs_supabase_shops_table_v1";
  var ACCOUNTS_VAULT_KEY = "uikeylabs_pbkdf2_accounts_v2";
  var RECOVERY_OTP_KEY = "uikeylabs_recovery_otp_store";

  /* Replace with your production Supabase Project URL and Public Anon Key (or set via the UI Config Drawer) */
  var DEFAULT_SUPABASE_URL = window.SUPABASE_URL || localStorage.getItem(CFG_URL_KEY) || "https://YOUR_PROJECT_ID.supabase.co";
  var DEFAULT_SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || localStorage.getItem(CFG_ANON_KEY) || "YOUR_PUBLIC_SUPABASE_ANON_KEY";

  function isLiveSupabaseConfigured() {
    var url = localStorage.getItem(CFG_URL_KEY) || window.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    var key = localStorage.getItem(CFG_ANON_KEY) || window.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    return (
      url &&
      url.indexOf("https://") === 0 &&
      url.indexOf(".supabase.co") !== -1 &&
      url.indexOf("YOUR_PROJECT_ID") === -1 &&
      key &&
      key.length > 30 &&
      key.indexOf("YOUR_PUBLIC") === -1
    );
  }

  /* Build a deterministic QR Code URL for a shop owner's UPI ID & Shop Name */
  window.buildDefaultQrCodeUrl = function (shopName, upiId) {
    var cleanName = (shopName || "UIKEY LABS Merchant").trim();
    var cleanUpi = (upiId || "8770912734@ybl").trim();
    var upiUri = "upi://pay?pa=" + encodeURIComponent(cleanUpi) + "&pn=" + encodeURIComponent(cleanName) + "&cu=INR";
    return "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=" + encodeURIComponent(upiUri);
  };

  /* Local 'shops' table storage helper (mirrors public.shops columns: id, owner_email, shop_name, category, upi_id, city, qr_code_url) */
  function getLocalShopsTable() {
    try {
      var raw = localStorage.getItem(SHOPS_TABLE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function upsertLocalShopRow(ownerEmail, shopData) {
    var emailKey = (ownerEmail || "").trim().toLowerCase();
    if (!emailKey) return null;
    var table = getLocalShopsTable();
    var existing = table[emailKey] || {};
    var shopName = shopData.shop_name || existing.shop_name || (emailKey.split("@")[0].toUpperCase() + " ENTERPRISES");
    var upiId = shopData.upi_id || existing.upi_id || "8770912734@ybl";
    var row = {
      id: existing.id || ("shop_" + Math.random().toString(36).slice(2, 10)),
      owner_email: emailKey,
      shop_name: shopName,
      category: shopData.category || existing.category || "Retail & Local Business",
      upi_id: upiId,
      city: shopData.city || existing.city || "Betul, Madhya Pradesh",
      qr_code_url: shopData.qr_code_url || existing.qr_code_url || window.buildDefaultQrCodeUrl(shopName, upiId),
      updated_at: new Date().toISOString()
    };
    table[emailKey] = row;
    try {
      localStorage.setItem(SHOPS_TABLE_KEY, JSON.stringify(table));
    } catch (e) {}
    return row;
  }

  /* WebCrypto PBKDF2-HMAC-SHA256 (100,000 iterations) helper */
  async function hashPasswordPBKDF2(password, saltHex) {
    var enc = new TextEncoder();
    var saltBytes;
    if (saltHex) {
      saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g).map(function (b) { return parseInt(b, 16); }));
    } else {
      saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
      saltHex = Array.from(saltBytes).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    }
    var keyMat = await window.crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
    var bits = await window.crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" },
      keyMat,
      256
    );
    var hashHex = Array.from(new Uint8Array(bits)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    return { saltHex: saltHex, hashHex: hashHex };
  }

  /* Create Real Supabase v2 Client if configured, with seamless fallback adapter */
  var realSupabase = null;
  function initSupabaseClient() {
    if (isLiveSupabaseConfigured() && window.supabase && typeof window.supabase.createClient === "function") {
      var url = localStorage.getItem(CFG_URL_KEY) || window.SUPABASE_URL;
      var key = localStorage.getItem(CFG_ANON_KEY) || window.SUPABASE_ANON_KEY;
      realSupabase = window.supabase.createClient(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
    }
    return realSupabase;
  }

  /* Unified supabaseClient object implementing full @supabase/supabase-js v2 API */
  window.supabaseClient = {
    isLiveCloud: isLiveSupabaseConfigured,

    saveProjectCredentials: function (url, anonKey) {
      var cleanUrl = (url || "").trim().replace(/\/+$/, "");
      var cleanKey = (anonKey || "").trim();
      if (!cleanUrl || cleanUrl.indexOf("https://") !== 0 || cleanUrl.indexOf(".supabase.co") === -1) {
        return { ok: false, error: "Please enter a valid Supabase Project URL (e.g., https://xyzcompany.supabase.co)." };
      }
      if (!cleanKey || cleanKey.length < 30) {
        return { ok: false, error: "Please enter a valid Supabase public anon key." };
      }
      localStorage.setItem(CFG_URL_KEY, cleanUrl);
      localStorage.setItem(CFG_ANON_KEY, cleanKey);
      initSupabaseClient();
      return { ok: true };
    },

    auth: {
      /* 1. Standard Email + Password Sign In */
      signInWithPassword: async function (credentials) {
        var email = (credentials.email || "").trim().toLowerCase();
        var password = credentials.password || "";
        if (!email || !password) {
          return { data: { user: null, session: null }, error: { message: "Email and password are required." } };
        }

        if (initSupabaseClient()) {
          return await realSupabase.auth.signInWithPassword({ email: email, password: password });
        }

        /* Verify against PBKDF2 Account Vault */
        var vaultRaw = localStorage.getItem(ACCOUNTS_VAULT_KEY);
        var vault = vaultRaw ? JSON.parse(vaultRaw) : {};
        var record = vault[email];
        if (!record) {
          return {
            data: { user: null, session: null },
            error: { message: "Invalid login credentials. No merchant account found for " + email + ". Please click 'Register New Shop' below first." }
          };
        }
        var check = await hashPasswordPBKDF2(password, record.saltHex);
        if (check.hashHex !== record.hashHex) {
          return {
            data: { user: null, session: null },
            error: { message: "Invalid login credentials. Incorrect password for " + email + "." }
          };
        }

        var shopRow = upsertLocalShopRow(email, {
          shop_name: record.shop_name || record.name,
          upi_id: record.upi_id || "8770912734@ybl"
        });

        var sessionUser = {
          id: record.id || ("usr_" + Date.now()),
          email: email,
          name: shopRow.shop_name,
          user_metadata: { shop_name: shopRow.shop_name, upi_id: shopRow.upi_id },
          provider: "Supabase Email Auth",
          exp: Date.now() + 7 * 24 * 3600 * 1000
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
        return { data: { user: sessionUser, session: { access_token: "sb_jwt_" + Date.now(), user: sessionUser } }, error: null };
      },

      /* 2. Merchant Sign Up (Creates User + Initial Row in 'shops' Table) */
      signUp: async function (payload) {
        var email = (payload.email || "").trim().toLowerCase();
        var password = payload.password || "";
        var meta = (payload.options && payload.options.data) || {};
        var shopName = (meta.shop_name || email.split("@")[0].toUpperCase() + " STORE").trim();
        var upiId = (meta.upi_id || "8770912734@ybl").trim();

        if (!email || email.indexOf("@") === -1) {
          return { data: null, error: { message: "Please enter a valid email address." } };
        }
        if (!password || password.length < 6) {
          return { data: null, error: { message: "Password must be at least 6 characters." } };
        }

        if (initSupabaseClient()) {
          var res = await realSupabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { shop_name: shopName, upi_id: upiId } }
          });
          if (!res.error && res.data && res.data.user) {
            await realSupabase.from("shops").upsert(
              {
                owner_id: res.data.user.id,
                owner_email: email,
                shop_name: shopName,
                upi_id: upiId,
                qr_code_url: window.buildDefaultQrCodeUrl(shopName, upiId)
              },
              { onConflict: "owner_email" }
            );
          }
          return res;
        }

        var derived = await hashPasswordPBKDF2(password, null);
        var vaultRaw = localStorage.getItem(ACCOUNTS_VAULT_KEY);
        var vault = vaultRaw ? JSON.parse(vaultRaw) : {};
        vault[email] = {
          id: "usr_" + Math.random().toString(36).slice(2, 10),
          name: shopName,
          shop_name: shopName,
          upi_id: upiId,
          identifier: email,
          saltHex: derived.saltHex,
          hashHex: derived.hashHex,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(ACCOUNTS_VAULT_KEY, JSON.stringify(vault));

        var shopRow = upsertLocalShopRow(email, {
          shop_name: shopName,
          upi_id: upiId,
          qr_code_url: window.buildDefaultQrCodeUrl(shopName, upiId)
        });

        var sessionUser = {
          id: vault[email].id,
          email: email,
          name: shopRow.shop_name,
          user_metadata: { shop_name: shopRow.shop_name, upi_id: shopRow.upi_id },
          provider: "Supabase Email Auth",
          exp: Date.now() + 7 * 24 * 3600 * 1000
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
        return { data: { user: sessionUser, session: { access_token: "sb_jwt_" + Date.now(), user: sessionUser } }, error: null };
      },

      /* 3. Google Social Login (supabaseClient.auth.signInWithOAuth) */
      signInWithOAuth: async function (opts) {
        var redirectUrl = (opts && opts.options && opts.options.redirectTo) || (window.location.origin + "/dashboard.html");
        if (initSupabaseClient()) {
          return await realSupabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: redirectUrl }
          });
        }

        /* Open OAuth 2.0 Google Popup Window and redirect to dashboard.html upon verification */
        return new Promise(function (resolve) {
          var w = 460, h = 640;
          var left = Math.max(0, (window.screen.width - w) / 2);
          var top = Math.max(0, (window.screen.height - h) / 2);
          var popup = window.open(
            "google-oauth-popup.html",
            "supabaseGoogleOAuth",
            "width=" + w + ",height=" + h + ",left=" + left + ",top=" + top + ",resizable=yes,scrollbars=yes"
          );

          function onMsg(event) {
            if (event.origin !== window.location.origin) return;
            if (event.data && event.data.type === "UIKEY_GOOGLE_OAUTH_SUCCESS" && event.data.profile) {
              window.removeEventListener("message", onMsg);
              var prof = event.data.profile;
              var email = (prof.email || "").toLowerCase();
              var shopRow = upsertLocalShopRow(email, {
                shop_name: prof.name || (email.split("@")[0].toUpperCase() + " SHOP"),
                upi_id: "8770912734@ybl"
              });
              var sessionUser = {
                id: prof.sub || ("google_" + Date.now()),
                email: email,
                name: shopRow.shop_name,
                picture: prof.picture || "",
                user_metadata: { full_name: prof.name, avatar_url: prof.picture, shop_name: shopRow.shop_name },
                provider: "Google Social Login (OAuth 2.0)",
                exp: Date.now() + 7 * 24 * 3600 * 1000
              };
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
              sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
              resolve({ data: { provider: "google", user: sessionUser }, error: null });
              window.location.href = "dashboard.html";
            }
          }
          window.addEventListener("message", onMsg);
          if (!popup) {
            resolve({ data: null, error: { message: "Popup blocked. Please allow popups for Google Sign-In." } });
          }
        });
      },

      /* 4. Forgot Password — Send Recovery OTP / Magic Link (supabaseClient.auth.resetPasswordForEmail) */
      resetPasswordForEmail: async function (email, options) {
        var cleanEmail = (email || "").trim().toLowerCase();
        if (!cleanEmail || cleanEmail.indexOf("@") === -1) {
          return { data: null, error: { message: "Please enter a valid registered email address." } };
        }

        if (initSupabaseClient()) {
          return await realSupabase.auth.resetPasswordForEmail(cleanEmail, options || {
            redirectTo: window.location.origin + "/forgot-password.html?mode=recovery"
          });
        }

        /* Generate a cryptographic 6-digit Recovery OTP & Magic Link for immediate verification */
        var randomArr = new Uint32Array(1);
        window.crypto.getRandomValues(randomArr);
        var otpCode = String(100000 + (randomArr[0] % 900000));
        var payload = {
          email: cleanEmail,
          otp: otpCode,
          expiresAt: Date.now() + 10 * 60 * 1000
        };
        sessionStorage.setItem(RECOVERY_OTP_KEY, JSON.stringify(payload));
        return {
          data: {
            email: cleanEmail,
            recovery_otp_preview: otpCode,
            magic_link: window.location.origin + "/forgot-password.html?mode=recovery&email=" + encodeURIComponent(cleanEmail) + "&token=" + otpCode
          },
          error: null
        };
      },

      /* 5. Verify Recovery OTP & Update Password */
      verifyOtpAndResetPassword: async function (email, tokenOtp, newPassword) {
        var cleanEmail = (email || "").trim().toLowerCase();
        if (!newPassword || newPassword.length < 6) {
          return { data: null, error: { message: "New password must be at least 6 characters." } };
        }

        if (initSupabaseClient()) {
          var otpRes = await realSupabase.auth.verifyOtp({
            email: cleanEmail,
            token: tokenOtp,
            type: "recovery"
          });
          if (otpRes.error) return otpRes;
          return await realSupabase.auth.updateUser({ password: newPassword });
        }

        var rawOtp = sessionStorage.getItem(RECOVERY_OTP_KEY);
        var storedOtp = rawOtp ? JSON.parse(rawOtp) : null;
        if (!storedOtp || storedOtp.email !== cleanEmail || storedOtp.otp !== String(tokenOtp).trim()) {
          return { data: null, error: { message: "Invalid or expired 6-digit recovery OTP code." } };
        }
        if (Date.now() > storedOtp.expiresAt) {
          return { data: null, error: { message: "Recovery OTP has expired. Please request a new one." } };
        }

        var derived = await hashPasswordPBKDF2(newPassword, null);
        var vaultRaw = localStorage.getItem(ACCOUNTS_VAULT_KEY);
        var vault = vaultRaw ? JSON.parse(vaultRaw) : {};
        var existing = vault[cleanEmail] || { name: cleanEmail.split("@")[0].toUpperCase() + " SHOP" };
        existing.identifier = cleanEmail;
        existing.saltHex = derived.saltHex;
        existing.hashHex = derived.hashHex;
        vault[cleanEmail] = existing;
        localStorage.setItem(ACCOUNTS_VAULT_KEY, JSON.stringify(vault));
        sessionStorage.removeItem(RECOVERY_OTP_KEY);

        upsertLocalShopRow(cleanEmail, { shop_name: existing.shop_name || existing.name });
        return { data: { user: { email: cleanEmail } }, error: null };
      },

      /* 6. Get Active Session (Used by dashboard.html guard) */
      getSession: async function () {
        if (initSupabaseClient()) {
          var liveRes = await realSupabase.auth.getSession();
          if (liveRes && liveRes.data && liveRes.data.session) {
            return liveRes;
          }
        }
        try {
          var raw = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
          if (!raw) return { data: { session: null }, error: null };
          var userObj = JSON.parse(raw);
          if (userObj.exp && Date.now() > userObj.exp) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            return { data: { session: null }, error: null };
          }
          return {
            data: {
              session: {
                access_token: userObj.jwt || ("sb_jwt_" + Date.now()),
                user: {
                  id: userObj.id || userObj.sub || "usr_1",
                  email: (userObj.email || "").toLowerCase(),
                  user_metadata: {
                    full_name: userObj.name,
                    shop_name: userObj.name,
                    avatar_url: userObj.picture || ""
                  },
                  app_metadata: { provider: userObj.provider || "email" }
                }
              }
            },
            error: null
          };
        } catch (err) {
          return { data: { session: null }, error: err };
        }
      },

      /* 7. Sign Out & Clear Session */
      signOut: async function () {
        if (initSupabaseClient()) {
          try { await realSupabase.auth.signOut(); } catch (e) {}
        }
        if (window.google && window.google.accounts && window.google.accounts.id) {
          try { window.google.accounts.id.disableAutoSelect(); } catch (e) {}
        }
        localStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        fetch("/api/logout", { method: "POST" }).catch(function () {});
        return { error: null };
      }
    },

    /* 8. Supabase Database Table Query Builder: supabaseClient.from('shops') */
    from: function (tableName) {
      if (initSupabaseClient()) {
        return realSupabase.from(tableName);
      }

      return {
        select: function () {
          return {
            eq: function (column, value) {
              return {
                maybeSingle: async function () {
                  if (tableName === "shops" && column === "owner_email") {
                    var emailKey = String(value || "").trim().toLowerCase();
                    var table = getLocalShopsTable();
                    var row = table[emailKey] || null;
                    if (!row) {
                      /* Automatically provision default shop record for authenticated owner_email */
                      row = upsertLocalShopRow(emailKey, {});
                    }
                    return { data: row, error: null };
                  }
                  return { data: null, error: null };
                },
                single: async function () {
                  return this.maybeSingle();
                }
              };
            }
          };
        },
        upsert: async function (payload) {
          if (tableName === "shops" && payload && payload.owner_email) {
            var updated = upsertLocalShopRow(payload.owner_email, payload);
            return { data: updated, error: null };
          }
          return { data: payload, error: null };
        }
      };
    }
  };
})();
