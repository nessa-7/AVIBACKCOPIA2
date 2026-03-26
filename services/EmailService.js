/**
 * EmailService — Envío de correos transaccionales con Brevo (API REST).
 * No requiere ninguna librería adicional: usa fetch nativo de Node.js 18+.
 */

const BREVO_API_KEY   = process.env.BREVO_API_KEY;
const BREVO_API_URL   = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME     = process.env.BREVO_SENDER_NAME  || 'AVI - SENA';
const SENDER_EMAIL    = process.env.BREVO_SENDER_EMAIL  || 'no-reply@avi-sena.com';

/**
 * Envía un correo de verificación con el código de 6 dígitos.
 * @param {string} to        - Correo del destinatario
 * @param {string} nombre    - Nombre del aspirante
 * @param {string} codigo    - Código de 6 dígitos
 */
async function enviarCodigoVerificacion(to, nombre, codigo) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY no está configurada en el .env');
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width:520px;background:linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
              
              <!-- LOGO / MARCA -->
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <div style="display:inline-block;background:linear-gradient(135deg,#39a900,#2d8600);border-radius:12px;padding:10px 24px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:2px;">AVI</span>
                    <span style="color:rgba(255,255,255,0.7);font-size:12px;margin-left:6px;">SENA</span>
                  </div>
                </td>
              </tr>

              <!-- TÍTULO -->
              <tr>
                <td align="center" style="padding-bottom:8px;">
                  <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">Verifica tu cuenta</h1>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <p style="color:rgba(255,255,255,0.6);font-size:15px;margin:0;">Hola, <strong style="color:#ffffff;">${nombre}</strong>. Usa el siguiente código para completar tu registro.</p>
                </td>
              </tr>

              <!-- CÓDIGO -->
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <div style="background:rgba(57,169,0,0.12);border:2px solid rgba(57,169,0,0.4);border-radius:16px;padding:24px 40px;display:inline-block;">
                    <span style="color:#39a900;font-size:42px;font-weight:900;letter-spacing:12px;font-family:monospace;">${codigo}</span>
                  </div>
                </td>
              </tr>

              <!-- AVISO DE EXPIRACIÓN -->
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:0;">
                    Este código expira en <strong style="color:rgba(255,255,255,0.7);">15 minutos</strong>.<br>
                    Si no solicitaste este registro, ignora este correo.
                  </p>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td align="center" style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">
                  <p style="color:rgba(255,255,255,0.25);font-size:12px;margin:0;">
                    © ${new Date().getFullYear()} AVI — Plataforma Vocacional SENA CTPI
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const payload = {
    sender:   { name: SENDER_NAME, email: SENDER_EMAIL },
    to:       [{ email: to, name: nombre }],
    subject:  `${codigo} — Tu código de verificación AVI`,
    htmlContent: html,
  };

  const res = await fetch(BREVO_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'api-key':       BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const msg = errorBody?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(`[Brevo] Error enviando correo: ${msg}`);
  }

  console.log(`[Brevo] ✅ Código ${codigo} enviado a ${to}`);
  return true;
}

module.exports = { enviarCodigoVerificacion };
