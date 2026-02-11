import { Plus, Package, Truck, Zap, Target, Bell, Users, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function MayoristasPage() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] text-gray-900 dark:text-white pb-20">
            {/* Hero Section */}
            <div className="relative bg-black text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-black z-0" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-widest mb-6">
                        <Package className="w-4 h-4" /> Usuarios Mayoristas
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Precios Exclusivos <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            para tu Negocio
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        Accedé a descuentos de hasta 30% en toda nuestra línea de filamentos y condiciones especiales.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/registro" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                            Crear Cuenta
                        </Link>
                        <Link href="/tienda" className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/30">
                            Ver Productos
                        </Link>
                    </div>
                </div>
            </div>

            {/* Benefits Grid */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-black mb-4">¿Por qué ser Mayorista?</h2>
                    <p className="text-gray-500 dark:text-gray-400">Descubrí los beneficios exclusivos diseñados para escalar tu producción.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <BenefitCard
                        icon={Target}
                        title="Precios Especiales"
                        desc="Acceso a precios mayoristas con descuentos de hasta 30% en toda nuestra línea de filamentos 3D."
                    />
                    <BenefitCard
                        icon={Truck}
                        title="Envíos Preferenciales"
                        desc="Envío gratis al alcanzar el monto mínimo o al comprar la cantidad requerida de productos."
                    />
                    <BenefitCard
                        icon={Zap}
                        title="Proceso Automático"
                        desc="Registro y renovación 100% automáticos. El sistema detecta tus compras y actualiza tu estado."
                    />
                    <BenefitCard
                        icon={Package}
                        title="Cupo Flexible"
                        desc="Sistema de cupo mensual adaptado a tu negocio, con seguimiento en tiempo real."
                    />
                    <BenefitCard
                        icon={Bell}
                        title="Notificaciones"
                        desc="Recibí avisos por email sobre tu estado de membresía, renovaciones y recordatorios."
                    />
                    <BenefitCard
                        icon={Users}
                        title="Atención Prioritaria"
                        desc="Soporte preferencial para mayoristas con atención personalizada para tu negocio."
                    />
                </div>
            </div>

            {/* Steps Section */}
            <div className="bg-white dark:bg-[#111] py-20 border-y border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black mb-4">¿Cómo me convierto en Mayorista?</h2>
                        <p className="text-gray-500">Seguí estos simples pasos para activar tu membresía automáticamente.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-16">
                        <StatCard number="150" label="Unidades Mínimas de Registro" />
                        <StatCard number="1x" label="Compra Única Inicial" />
                        <StatCard number="0" label="Costo de Inscripción" />
                        <StatCard number="100%" label="Automático" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-8 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-0" />

                        <StepCard
                            number="1"
                            title="Creá tu Cuenta"
                            desc="Registrate en nuestra tienda como usuario normal. Completá tus datos personales y de facturación."
                        />
                        <StepCard
                            number="2"
                            title="Realizá tu Primera Compra"
                            desc="Comprá 150 unidades o más de productos habilitados (filamentos). Podés combinar marcas y colores."
                        />
                        <StepCard
                            number="3"
                            title="Activación Automática"
                            desc="Al completar el pedido, el sistema convierte tu cuenta a Mayorista y activa los precios especiales."
                        />
                        <StepCard
                            number="4"
                            title="¡Empezá a Comprar!"
                            desc="Desde ese momento, todos los productos mostrarán automáticamente los Precios Mayoristas."
                        />
                    </div>

                    <div className="mt-12 bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl flex items-start gap-4 max-w-3xl mx-auto">
                        <div className="p-2 bg-purple-500 rounded-lg text-white shrink-0">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-purple-400 mb-1">Tip Importante</h4>
                            <p className="text-sm text-gray-400">Podés elegir cualquier combinación de productos habilitados. Por ejemplo: 80 PLA + 40 PETG + 30 TPU = 150 unidades ✅</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Maintenance System */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-black mb-4">Sistema de Renovación Mensual</h2>
                    <p className="text-gray-500 dark:text-gray-400">Mantené tu membresía activa mes a mes de forma simple.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="bg-gray-900 border border-white/10 p-6 rounded-2xl">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-purple-500" /> Cupo Mensual
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Para mantener tu estado <span className="text-green-500 font-bold">Vigente</span>, necesitás completar un cupo de <strong className="text-white">75 unidades mensuales</strong> de productos habilitados antes del día 10 de cada mes.
                            </p>
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500" />
                            </div>
                            <p className="text-xs text-right text-gray-500 mt-2">75 / 75 Unidades</p>
                        </div>

                        <div className="space-y-4">
                            <RenewalItem
                                icon={Check}
                                color="text-green-500"
                                title="Renovación Automática"
                                desc="Si completás el cupo, tu membresía se renueva automáticamente por 30 días más."
                            />
                            <RenewalItem
                                icon={AlertCircle}
                                color="text-yellow-500"
                                title="Si no completás el cupo"
                                desc="Tu estado cambia a 'Vencido', pero no perdés tu cuenta. Completá el cupo pendiente para reactivar."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <StatCard number="75" label="Unidades Mensuales" />
                        <StatCard number="10" label="Día de Vencimiento" />
                        <StatCard number="Auto" label="Renovación" />
                        <StatCard number="Panel" label="Seguimiento Real" />
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-white dark:bg-[#111] py-20 border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-black mb-12 text-center">Preguntas Frecuentes</h2>
                    <div className="space-y-6">
                        <FAQItem
                            question="¿Qué productos cuentan para el cupo?"
                            answer="Todos los filamentos 3D de nuestra tienda (PLA, PETG, ABS, TPU, etc.) independientemente de la marca, color o material."
                        />
                        <FAQItem
                            question="¿Puedo comprar otros productos siendo mayorista?"
                            answer="¡Sí! Podés comprar cualquier producto de la tienda. Los que NO cuenten para el cupo simplemente no sumarán unidades, pero no hay restricciones."
                        />
                        <FAQItem
                            question="¿Qué pasa si un mes no llego al cupo?"
                            answer="Tu estado cambia a «Vencido» pero NO perdés tu cuenta mayorista. Cuando completes el cupo pendiente, tu estado vuelve a «Vigente» automáticamente."
                        />
                        <FAQItem
                            question="¿Los precios son mejores que los minoristas?"
                            answer="¡Absolutamente! Los descuentos mayoristas pueden llegar hasta el 30% del precio regular, y se muestran claramente en cada producto."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function BenefitCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 hover:border-purple-500/50 transition-colors group">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
        </div>
    )
}

function StepCard({ number, title, desc }: any) {
    return (
        <div className="relative z-10 bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">
            <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-bold mx-auto mb-4 text-lg">
                {number}
            </div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
        </div>
    )
}

function StatCard({ number, label }: any) {
    return (
        <div className="bg-gray-100 dark:bg-[#1a1a1a] p-6 rounded-2xl text-center">
            <div className="text-3xl font-black text-purple-500 mb-1">{number}</div>
            <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">{label}</div>
        </div>
    )
}

function RenewalItem({ icon: Icon, color, title, desc }: any) {
    return (
        <div className="flex gap-4">
            <div className={`mt-1 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-bold text-white mb-1">{title}</h4>
                <p className="text-sm text-gray-400">{desc}</p>
            </div>
        </div>
    )
}

function FAQItem({ question, answer }: any) {
    return (
        <div className="bg-gray-50 dark:bg-[#161616] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{question}</h4>
            <p className="text-gray-600 dark:text-gray-400">{answer}</p>
        </div>
    )
}
