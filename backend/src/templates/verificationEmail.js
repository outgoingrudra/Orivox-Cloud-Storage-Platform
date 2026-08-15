export const verificationEmailTemplate = ({ verifyUrl }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f4f4f5;
          font-family:Arial,Helvetica,sans-serif;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="padding:40px 16px;"
        >
          <tr>
            <td align="center">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width:560px;
                  background:#ffffff;
                  border:1px solid #e4e4e7;
                  border-radius:16px;
                  overflow:hidden;
                "
              >

                <!-- HEADER -->
                <tr>
                  <td
                    style="
                      background:#09090b;
                      padding:28px 36px;
                      text-align:left;
                    "
                  >
                    <div
                      style="
                        color:#ffffff;
                        font-size:22px;
                        font-weight:700;
                        letter-spacing:-0.5px;
                      "
                    >
                      ORIVOX
                    </div>

                    <div
                      style="
                        color:#a1a1aa;
                        font-size:12px;
                        margin-top:5px;
                        letter-spacing:0.5px;
                      "
                    >
                      Your files. Your workspace.
                    </div>
                  </td>
                </tr>

                <!-- CONTENT -->
                <tr>
                  <td style="padding:42px 36px 36px;">

                    <div
                      style="
                        display:inline-block;
                        background:#f4f4f5;
                        border-radius:20px;
                        padding:7px 12px;
                        color:#52525b;
                        font-size:12px;
                        font-weight:600;
                      "
                    >
                      EMAIL VERIFICATION
                    </div>

                    <h1
                      style="
                        margin:22px 0 12px;
                        color:#09090b;
                        font-size:28px;
                        line-height:1.25;
                        letter-spacing:-0.8px;
                      "
                    >
                      You're almost there.
                    </h1>

                    <p
                      style="
                        margin:0;
                        color:#52525b;
                        font-size:15px;
                        line-height:1.7;
                      "
                    >
                      Welcome to Orivox. Verify your email address to activate
                      your account and start managing your files securely.
                    </p>

                    <!-- BUTTON -->
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="margin-top:30px;"
                    >
                      <tr>
                        <td
                          style="
                            background:#09090b;
                            border-radius:8px;
                          "
                        >
                          <a
                            href="${verifyUrl}"
                            style="
                              display:inline-block;
                              padding:14px 26px;
                              color:#ffffff;
                              text-decoration:none;
                              font-size:14px;
                              font-weight:600;
                            "
                          >
                            Verify email &nbsp;→
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- EXPIRY -->
                    <div
                      style="
                        margin-top:32px;
                        padding:16px;
                        background:#fafafa;
                        border:1px solid #eeeeee;
                        border-radius:8px;
                      "
                    >
                      <p
                        style="
                          margin:0;
                          color:#71717a;
                          font-size:13px;
                          line-height:1.6;
                        "
                      >
                        For your security, this verification link will expire
                        in <strong style="color:#18181b;">30 minutes</strong>.
                      </p>
                    </div>

                    <div
                      style="
                        border-top:1px solid #eeeeee;
                        margin:32px 0 24px;
                      "
                    ></div>

                    <p
                      style="
                        margin:0;
                        color:#a1a1aa;
                        font-size:12px;
                        line-height:1.6;
                      "
                    >
                      If you didn't create an Orivox account, no action is
                      required. You can safely ignore this email.
                    </p>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td
                    style="
                      background:#fafafa;
                      border-top:1px solid #eeeeee;
                      padding:20px 36px;
                    "
                  >
                    <p
                      style="
                        margin:0;
                        color:#a1a1aa;
                        font-size:11px;
                      "
                    >
                      © ${new Date().getFullYear()} Orivox · Secure cloud workspace
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
};