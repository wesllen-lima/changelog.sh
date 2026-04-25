import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { Resend } from 'resend'
import { db } from './db'
import { config } from './config'
import { users, sessions, accounts, verifications } from './db/schema'

function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resend = new Resend(config.RESEND_API_KEY)
  return resend.emails.send({ from: config.RESEND_FROM, to, subject, html }).then(() => undefined)
}

const plugins = config.RESEND_API_KEY
  ? [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendEmail(
            email,
            'Seu link de acesso — changelog.sh',
            `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
              <p style="font-size:15px;color:#111110;margin-bottom:24px">
                Clique no botão abaixo para entrar no seu dashboard. O link expira em 5 minutos.
              </p>
              <a href="${url}" style="display:inline-block;background:#111110;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
                Entrar no dashboard →
              </a>
              <p style="margin-top:24px;font-size:12px;color:#a8a49d">
                Se você não solicitou este link, ignore este email.
              </p>
            </div>`,
          )
        },
        disableSignUp: true,
      }),
    ]
  : []

const emailAndPassword = config.RESEND_API_KEY
  ? {
      enabled: true,
      sendResetPassword: async ({ user: u, url }: { user: { email: string }; url: string }) => {
        await sendEmail(
          u.email,
          'Redefinir sua senha — changelog.sh',
          `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <p style="font-size:15px;color:#111110;margin-bottom:24px">
              Clique no botão abaixo para redefinir sua senha. O link expira em 1 hora.
            </p>
            <a href="${url}" style="display:inline-block;background:#111110;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
              Redefinir senha →
            </a>
            <p style="margin-top:24px;font-size:12px;color:#a8a49d">
              Se você não solicitou isso, ignore este email.
            </p>
          </div>`,
        )
      },
    }
  : { enabled: true }

export const auth = betterAuth({
  secret: config.BETTER_AUTH_SECRET,
  baseURL: `http://localhost:${config.PORT}`,
  trustedOrigins: [
    'http://localhost:5173',
    ...(config.ALLOWED_ORIGIN ? [config.ALLOWED_ORIGIN] : []),
  ],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword,
  plugins,
})

export const magicLinkEnabled = config.RESEND_API_KEY !== undefined
export const passwordResetEnabled = config.RESEND_API_KEY !== undefined

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
