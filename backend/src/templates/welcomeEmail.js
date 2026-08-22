export function welcomeEmailTemplate({
  name,
  appUrl,
}) {
  const displayName =
    name?.trim() || "there";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>Welcome to Orivox</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f4f5;
    font-family: Arial, Helvetica, sans-serif;
    color: #18181b;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color: #f4f4f5;
      padding: 42px 16px;
    "
  >
    <tr>
      <td align="center">

        <!-- MAIN CARD -->

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width: 100%;
            max-width: 620px;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #e4e4e7;
          "
        >

          <!-- HEADER -->

          <tr>
            <td
              style="
                padding: 24px 32px;
                border-bottom: 1px solid #e4e4e7;
              "
            >
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
              >
                <tr>
                  <td>
                    <span
                      style="
                        display: inline-block;
                        width: 38px;
                        height: 38px;
                        line-height: 38px;
                        text-align: center;
                        background: #18181b;
                        color: #ffffff;
                        border-radius: 11px;
                        font-size: 19px;
                      "
                    >
                      ☁
                    </span>

                    <span
                      style="
                        margin-left: 10px;
                        vertical-align: 12px;
                        font-size: 18px;
                        font-weight: 700;
                        letter-spacing: -0.3px;
                      "
                    >
                      Orivox
                    </span>
                  </td>

                  <td
                    align="right"
                    style="
                      font-size: 11px;
                      color: #a1a1aa;
                      text-transform: uppercase;
                      letter-spacing: 1.5px;
                      font-weight: 700;
                    "
                  >
                    Cloud Storage
                  </td>
                </tr>
              </table>
            </td>
          </tr>


          <!-- HERO -->

          <tr>
            <td
              style="
                background-color: #18181b;
                padding: 50px 32px;
                color: #ffffff;
              "
            >

              <div
                style="
                  display: inline-block;
                  padding: 7px 12px;
                  margin-bottom: 24px;
                  border-radius: 999px;
                  background-color: #27272a;
                  border: 1px solid #3f3f46;
                  color: #d4d4d8;
                  font-size: 11px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                "
              >
                ✓ Account verified
              </div>

              <h1
                style="
                  margin: 0;
                  font-size: 38px;
                  line-height: 1.1;
                  letter-spacing: -1.5px;
                  font-weight: 800;
                "
              >
                Welcome to
                <br />
                your cloud.
              </h1>

              <p
                style="
                  margin: 20px 0 0;
                  max-width: 450px;
                  font-size: 15px;
                  line-height: 25px;
                  color: #a1a1aa;
                "
              >
                Hi ${escapeHtml(displayName)}, your email is verified
                and your Orivox workspace is ready.
              </p>

            </td>
          </tr>


          <!-- CONTENT -->

          <tr>
            <td
              style="
                padding: 38px 32px 20px;
              "
            >

              <h2
                style="
                  margin: 0;
                  font-size: 20px;
                  letter-spacing: -0.4px;
                "
              >
                Everything you need,
                without the clutter.
              </h2>

              <p
                style="
                  margin: 10px 0 26px;
                  font-size: 14px;
                  line-height: 23px;
                  color: #71717a;
                "
              >
                Your workspace is ready for files, folders,
                secure sharing and developer integrations.
              </p>


              <!-- FEATURE 1 -->

              ${featureRow(
                "01",
                "Store & organize",
                "Upload your files securely and organize them with nested folders."
              )}

              ${featureRow(
                "02",
                "Share with control",
                "Give people Viewer or Editor access, or create public links when needed."
              )}

              ${featureRow(
                "03",
                "Build with Orivox",
                "Use API keys and the Developer API to connect your applications to Orivox storage."
              )}

            </td>
          </tr>


          <!-- CTA -->

          <tr>
            <td
              style="
                padding: 12px 32px 38px;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  background-color: #f4f4f5;
                  border-radius: 18px;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 24px;
                    "
                  >

                    <p
                      style="
                        margin: 0 0 6px;
                        font-size: 15px;
                        font-weight: 700;
                      "
                    >
                      Your workspace is waiting.
                    </p>

                    <p
                      style="
                        margin: 0 0 20px;
                        font-size: 13px;
                        line-height: 21px;
                        color: #71717a;
                      "
                    >
                      Sign in and start building your
                      Orivox workspace.
                    </p>

                    <a
                      href="${appUrl}"
                      style="
                        display: inline-block;
                        padding: 13px 20px;
                        background-color: #18181b;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 11px;
                        font-size: 13px;
                        font-weight: 700;
                      "
                    >
                      Open Orivox →
                    </a>

                  </td>
                </tr>
              </table>

            </td>
          </tr>


          <!-- SECURITY NOTE -->

          <tr>
            <td
              style="
                padding: 0 32px 32px;
              "
            >
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border-top: 1px solid #e4e4e7;
                "
              >
                <tr>
                  <td
                    style="
                      padding-top: 24px;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 12px;
                        line-height: 20px;
                        color: #a1a1aa;
                      "
                    >
                      🔒 Your account is protected by secure
                      authentication, permission-aware sharing
                      and controlled storage access.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>


          <!-- FOOTER -->

          <tr>
            <td
              align="center"
              style="
                padding: 24px 32px;
                background-color: #fafafa;
                border-top: 1px solid #e4e4e7;
              "
            >

              <p
                style="
                  margin: 0;
                  font-size: 12px;
                  font-weight: 700;
                  color: #52525b;
                "
              >
                Orivox
              </p>

              <p
                style="
                  margin: 6px 0 0;
                  font-size: 11px;
                  color: #a1a1aa;
                "
              >
                Your files. Smarter. Safer.
              </p>

              <p
                style="
                  margin: 14px 0 0;
                  font-size: 10px;
                  color: #d4d4d8;
                "
              >
                This email was sent because you successfully
                verified your Orivox account.
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
}


// ======================================================
// FEATURE ROW
// ======================================================

function featureRow(
  number,
  title,
  description
) {
  return `
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        margin-bottom: 12px;
        border: 1px solid #e4e4e7;
        border-radius: 14px;
      "
    >
      <tr>
        <td
          width="52"
          valign="top"
          style="
            padding: 18px 0 18px 18px;
          "
        >
          <div
            style="
              width: 34px;
              height: 34px;
              line-height: 34px;
              text-align: center;
              background-color: #18181b;
              color: #ffffff;
              border-radius: 10px;
              font-size: 10px;
              font-weight: 700;
            "
          >
            ${number}
          </div>
        </td>

        <td
          style="
            padding: 17px 18px;
          "
        >
          <p
            style="
              margin: 0;
              font-size: 14px;
              font-weight: 700;
              color: #18181b;
            "
          >
            ${title}
          </p>

          <p
            style="
              margin: 5px 0 0;
              font-size: 12px;
              line-height: 19px;
              color: #71717a;
            "
          >
            ${description}
          </p>
        </td>
      </tr>
    </table>
  `;
}


// ======================================================
// BASIC HTML ESCAPING
// ======================================================

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}