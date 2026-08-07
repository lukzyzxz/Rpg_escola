// ======================================
// SUPABASE.JS
// Conexão com Supabase
// ======================================

const SUPABASE_URL =
    "https://ewpgjwlkoesghxnszstm.supabase.co";

const SUPABASE_PUBLIC_KEY =
    "sb_publishable_Bzqu7W0fH0uALj_boyc7Vw_BqlChraI";


// ======================================
// CLIENTE GLOBAL
// ======================================

window.supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLIC_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );

console.log("✅ Supabase conectado.");