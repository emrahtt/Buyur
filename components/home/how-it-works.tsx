const STEPS = [
  {
    title: 'Ne lazım, yaz',
    body: 'Ev büyüklüğü, tarih, mahalle. Bir dakika sürer, hesap açman gerekmez.',
  },
  {
    title: 'Teklifleri karşılaştır',
    body: 'Mahallendeki ekipler fiyatını yazar. Yorumlara, rozetlere bak, istersen WhatsApp’tan sor.',
  },
  {
    title: 'Seç, işin bitsin',
    body: 'Beğendiğin teklifi kabul et. İş bitince puanla; bir sonraki komşun da bilsin.',
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="nasil" className="border-y bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 id="nasil" className="mb-8 text-3xl font-bold text-balance">
          Üç adımda temiz ev
        </h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-plate font-heading text-lg font-bold text-plate-foreground"
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
