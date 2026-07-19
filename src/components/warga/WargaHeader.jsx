'use client'
import PWAInstallButton from '@/components/PWAInstallButton'
import NotificationButton from '@/components/NotificationButton'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default function WargaHeader({ user }) {
  return (
    <>
      <div className="animate-fade-up mb-6">
        <p className="label-small mb-1">Tirta Asri Residence</p>
        <h1 className="section-title text-2xl">
          {getGreeting()}, {user?.nama?.replace(/^(Bapak|Ibu|Bp\.|Sdr\.|Sdri\.)\s+/i, '').split(' ')[0]}
        </h1>
        <p className="section-subtitle">Blok {user?.noRumah}</p>
      </div>
      <div className="animate-fade-up">
        <PWAInstallButton />
        <NotificationButton user={user} />
      </div>
    </>
  )
}
