import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Clock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { buildWhatsAppLink } from '../../lib/whatsapp';
import { track } from '../../lib/analytics';

interface SimulationItem {
  id: string;
  name: string;
  category: string;
  serviceSlug: string;
  problems: {
    id: string;
    label: string;
    basePriceMin: number;
    basePriceMax: number;
    turnaround: string;
    details: string;
  }[];
}

const SIMULATION_DATA: SimulationItem[] = [
  {
    id: 'tv',
    name: 'Televisor / Smart TV',
    category: 'domestico',
    serviceSlug: 'reparacao-de-televisores',
    problems: [
      {
        id: 'tv-backlight',
        label: 'Tem som mas o ecrã não tem imagem (Backlight LED)',
        basePriceMin: 25000,
        basePriceMax: 45000,
        turnaround: '24h - 48h',
        details: 'Substituição de réguas LED originais e ajuste de corrente da fonte de alimentação.',
      },
      {
        id: 'tv-power',
        label: 'Não liga nem acende a luz de presença (Standby)',
        basePriceMin: 20000,
        basePriceMax: 38000,
        turnaround: '24h - 48h',
        details: 'Diagnóstico da fonte primária (SMPS), substituição de transístores MOSFET e fusíveis.',
      },
      {
        id: 'tv-main',
        label: 'Reinicia em loop ou não sintoniza / HDMI sem sinal',
        basePriceMin: 25000,
        basePriceMax: 42000,
        turnaround: '48h - 72h',
        details: 'Diagnóstico da placa principal (Main Board), reprogramação SPI e regulação de tensão.',
      },
    ],
  },
  {
    id: 'lavar-roupa',
    name: 'Máquina de Lavar Roupa',
    category: 'domestico',
    serviceSlug: 'reparacao-de-maquinas-de-lavar',
    problems: [
      {
        id: 'lav-dreno',
        label: 'Não escoa / não drena a água (Erro de drenagem)',
        basePriceMin: 18000,
        basePriceMax: 32000,
        turnaround: '24h - 48h',
        details: 'Desobstrução do circuito hidráulico e eventual substituição da bomba de evacuação.',
      },
      {
        id: 'lav-ruido',
        label: 'Barulho intenso ao centrifugar / rolamentos com folga',
        basePriceMin: 35000,
        basePriceMax: 60000,
        turnaround: '48h - 72h',
        details: 'Desmontagem da cuba, substituição de rolamentos blindados e retentor vedante.',
      },
      {
        id: 'lav-placa',
        label: 'Código de erro no painel ou tambor não gira',
        basePriceMin: 25000,
        basePriceMax: 45000,
        turnaround: '24h - 48h',
        details: 'Reparação de circuitos da placa eletrónica Inverter ou verificação de escovas de motor.',
      },
    ],
  },
  {
    id: 'air-fryer',
    name: 'Air Fryer / Fritadeira sem Óleo',
    category: 'domestico',
    serviceSlug: 'reparacao-de-air-fryer',
    problems: [
      {
        id: 'af-dead',
        label: 'Não liga totalmente / desligou-se repentinamente',
        basePriceMin: 12000,
        basePriceMax: 22000,
        turnaround: '24h',
        details: 'Substituição do fusível térmico de segurança calibrado e revisão do isolamento.',
      },
      {
        id: 'af-no-heat',
        label: 'Ventila normalmente mas não aquece os alimentos',
        basePriceMin: 15000,
        basePriceMax: 26000,
        turnaround: '24h - 48h',
        details: 'Troca da resistência blindada ou do termóstato bimetálico de controlo.',
      },
      {
        id: 'af-display',
        label: 'Painel digital não responde ou botões com falha',
        basePriceMin: 14000,
        basePriceMax: 25000,
        turnaround: '24h - 48h',
        details: 'Limpeza ultrassónica de gordura interna e reparação da placa de comandos.',
      },
    ],
  },
  {
    id: 'micro-ondas',
    name: 'Forno Micro-ondas',
    category: 'domestico',
    serviceSlug: 'reparacao-de-micro-ondas',
    problems: [
      {
        id: 'mo-no-heat',
        label: 'Funciona o prato e o tempo mas não aquece',
        basePriceMin: 18000,
        basePriceMax: 32000,
        turnaround: '24h - 48h',
        details: 'Substituição do díodo de alta tensão, condensador cerâmico ou magnetrão.',
      },
      {
        id: 'mo-sparks',
        label: 'Faz faíscas dentro da cavidade de aquecimento',
        basePriceMin: 12000,
        basePriceMax: 20000,
        turnaround: '24h',
        details: 'Substituição da lâmina de mica protetora de ondas e higienização dielétrica.',
      },
      {
        id: 'mo-touch',
        label: 'Teclado de membrana não aceita comandos',
        basePriceMin: 15000,
        basePriceMax: 25000,
        turnaround: '24h - 48h',
        details: 'Reparação de barramento condutor da membrana ou substituição do teclado.',
      },
    ],
  },
  {
    id: 'placas',
    name: 'Placa Eletrónica / Módulo Inverter',
    category: 'eletronica',
    serviceSlug: 'reparacao-de-placas-eletronicas',
    problems: [
      {
        id: 'placa-curto',
        label: 'Dispara o disjuntor da casa / Curto-circuito primário',
        basePriceMin: 22000,
        basePriceMax: 45000,
        turnaround: '24h - 48h',
        details: 'Substituição de ponte retificadora, MOSFETs de potência e varístores de proteção.',
      },
      {
        id: 'placa-pista',
        label: 'Pistas queimadas ou danos visíveis por sobretensão',
        basePriceMin: 20000,
        basePriceMax: 40000,
        turnaround: '24h - 48h',
        details: 'Reconstrução de vias sob microscópio e substituição de circuitos integrados PWM.',
      },
    ],
  },
  {
    id: 'industrial',
    name: 'Equipamento Industrial / Comercial',
    category: 'industrial',
    serviceSlug: 'cozinhas-industriais',
    problems: [
      {
        id: 'ind-forno',
        label: 'Forno convector ou combinador com erro de temperatura',
        basePriceMin: 35000,
        basePriceMax: 70000,
        turnaround: '24h - 48h',
        details: 'Revisão de contactores trifásicos, resistências tubulares e sensores PT100.',
      },
      {
        id: 'ind-pos',
        label: 'Terminal POS ou balança eletrónica descalibrada',
        basePriceMin: 18000,
        basePriceMax: 35000,
        turnaround: '24h',
        details: 'Aferição de célula de carga, calibração de escala e reparação de fonte de alimentação.',
      },
    ],
  },
];

export const QuickBudgetSimulator: React.FC = () => {
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>(SIMULATION_DATA[0].id);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    SIMULATION_DATA[0].problems[0].id
  );

  const currentAppliance =
    SIMULATION_DATA.find((a) => a.id === selectedApplianceId) || SIMULATION_DATA[0];

  const currentProblem =
    currentAppliance.problems.find((p) => p.id === selectedProblemId) ||
    currentAppliance.problems[0];

  const handleApplianceChange = (applianceId: string) => {
    setSelectedApplianceId(applianceId);
    const target = SIMULATION_DATA.find((a) => a.id === applianceId);
    if (target && target.problems.length > 0) {
      setSelectedProblemId(target.problems[0].id);
    }
    track('filter', { type: 'budget_simulator_appliance', value: applianceId });
  };

  const handleProblemChange = (problemId: string) => {
    setSelectedProblemId(problemId);
    track('filter', { type: 'budget_simulator_problem', value: problemId });
  };

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value) + ' Kz';
  };

  // WhatsApp contextual message
  const whatsappSimMessage = `Olá Ama Tec! Fiz uma simulação de orçamento no vosso site para:\nAparelho: ${currentAppliance.name}\nProblema: ${currentProblem.label}\nEstimativa base obtida: ${formatKz(currentProblem.basePriceMin)} - ${formatKz(currentProblem.basePriceMax)}.\nGostaria de agendar o diagnóstico técnico na vossa oficina no Golf 2.`;
  const whatsappUrl = buildWhatsAppLink(whatsappSimMessage);

  return (
    <section
      id="simulador-orcamento"
      className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-2xl relative overflow-hidden"
    >
      {/* Background Accent Lines */}
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative space-y-8">
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
            <Calculator className="w-4 h-4 text-sky-400" />
            <span>Ferramenta Interativa</span>
            <span className="text-slate-600">·</span>
            <span>Ama Tec Luanda</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Simulador de Orçamento Rápido
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Selecione o seu tipo de equipamento e o sintoma observado para obter uma estimativa indicativa de mão-de-obra e prazos de bancada antes de entregar o aparelho.
          </p>
        </div>

        {/* Simulator Grid: Interactive Controls & Result Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Appliance */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. Selecione o Tipo de Aparelho
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SIMULATION_DATA.map((app) => {
                  const isSelected = app.id === selectedApplianceId;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleApplianceChange(app.id)}
                      className={`p-3 rounded-xl text-left text-xs font-medium transition-all flex flex-col justify-between border ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-900/40 font-semibold'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="leading-snug">{app.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Problem / Symptom */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                2. Selecione a Avaria ou Sintoma Observado
              </div>
              <div className="space-y-2">
                {currentAppliance.problems.map((problem) => {
                  const isSelected = problem.id === selectedProblemId;
                  return (
                    <button
                      key={problem.id}
                      type="button"
                      onClick={() => handleProblemChange(problem.id)}
                      className={`w-full p-3.5 rounded-xl text-left text-xs sm:text-sm transition-all flex items-start justify-between gap-3 border ${
                        isSelected
                          ? 'bg-slate-800 text-white border-sky-500 ring-1 ring-sky-500 font-medium'
                          : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            isSelected ? 'bg-sky-400' : 'bg-slate-600'
                          }`}
                        />
                        <span className="leading-relaxed">{problem.label}</span>
                      </div>
                      <span className="text-xs font-mono text-sky-400 shrink-0 font-medium">
                        ~{formatKz(problem.basePriceMin)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Result Card Column */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentAppliance.id}-${currentProblem.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-slate-950/90 rounded-2xl border border-slate-800 p-6 sm:p-7 space-y-6 shadow-xl"
              >
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Resumo da Simulação
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    {currentAppliance.name}
                  </h3>
                  <p className="text-xs text-sky-400 leading-snug mt-0.5">
                    {currentProblem.label}
                  </p>
                </div>

                {/* Price Display */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Estimativa Indicativa de Mão-de-Obra Base:
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    {formatKz(currentProblem.basePriceMin)} – {formatKz(currentProblem.basePriceMax)}
                  </div>
                  <span className="text-[11px] text-slate-400 block pt-1">
                    * Moeda oficial: Kwanza Angolano (AOA).
                  </span>
                </div>

                {/* Technical Specifications of the estimate */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>
                      Prazo Estimado de Diagnóstico:{' '}
                      <strong className="text-white font-medium">{currentProblem.turnaround}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Garantia Técnica:{' '}
                      <strong className="text-white font-medium">Incluída por escrito na entrega</strong>
                    </span>
                  </div>

                  <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-400">
                    <Wrench className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{currentProblem.details}</span>
                  </div>
                </div>

                {/* Disclaimer in accordance with strict truth in advertising rules */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Nota de Transparência:</strong> Valor indicativo de mão-de-obra e triagem técnica na bancada Ama Tec. O orçamento definitivo inclui as peças de reposição necessárias após diagnóstico físico presencial.
                  </span>
                </div>

                {/* CTAs */}
                <div className="space-y-2.5 pt-2">
                  <Link
                    to={`/solicitar-assistencia?servico=${currentAppliance.serviceSlug}&equipamento=${encodeURIComponent(currentAppliance.name)}`}
                    onClick={() =>
                      track('conversion', {
                        source: 'budget_simulator_btn',
                        appliance: currentAppliance.id,
                        problem: currentProblem.id,
                      })
                    }
                    className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm text-center shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Solicitar Diagnóstico com esta Estimativa</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track('whatsapp_click', {
                        source: 'budget_simulator_wa',
                        appliance: currentAppliance.id,
                        problem: currentProblem.id,
                      })
                    }
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs text-center border border-emerald-500/40 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-300" />
                    <span>Enviar Simulação no WhatsApp</span>
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
