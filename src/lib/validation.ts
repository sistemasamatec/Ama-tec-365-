export interface FormDataFields {
  name: string;
  phone: string;
  email?: string;
  equipment: string;
  serviceCategory?: string;
  problemDescription: string;
  location?: string;
  scheduledDate?: string;
  message?: string;
  honeypot?: string;
  privacyConsent?: boolean;
}

export interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  equipment?: string;
  serviceCategory?: string;
  problemDescription?: string;
  location?: string;
  honeypot?: string;
  privacyConsent?: string;
  general?: string;
}

/**
 * Validação única partilhada entre cliente e servidor (schema consistente).
 * Cumpre a regra de formulário curto (essencial: nome, telefone, equipamento, problema).
 */
export function validateAssistanceForm(data: FormDataFields): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  // Deteção de spam (Honeypot field deve estar vazio)
  if (data.honeypot && data.honeypot.trim() !== '') {
    errors.honeypot = 'Submissão rejeitada por filtro de segurança.';
  }

  // Nome (mínimo 3 caracteres, máximo 100, obrigatório)
  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Por favor indique o seu nome completo (mínimo 3 caracteres).';
  } else if (data.name.trim().length > 100) {
    errors.name = 'O nome não deve exceder 100 caracteres.';
  }

  // Telefone (obrigatório, validação para Angola / internacional)
  const phoneClean = (data.phone || '').replace(/[\s\-\(\)\.]/g, '');
  if (!phoneClean) {
    errors.phone = 'O número de telefone é obrigatório para contacto.';
  } else if (!/^(\+?244)?[9]\d{8}$/.test(phoneClean) && phoneClean.length < 8) {
    errors.phone = 'Por favor indique um número de telefone válido (ex: 930 372 597 ou +244 930 372 597).';
  } else if (phoneClean.length > 30) {
    errors.phone = 'Número de telefone demasiado longo.';
  }

  // Email (opcional, mas se fornecido deve ter formato válido)
  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Por favor introduza um endereço de email válido (ou deixe em branco).';
    } else if (data.email.trim().length > 120) {
      errors.email = 'O email não deve exceder 120 caracteres.';
    }
  }

  // Equipamento (obrigatório)
  if (!data.equipment || data.equipment.trim().length < 2) {
    errors.equipment = 'Indique o equipamento (ex: Televisor Samsung 55, Air Fryer Philips).';
  } else if (data.equipment.trim().length > 120) {
    errors.equipment = 'O equipamento não deve exceder 120 caracteres.';
  }

  // Descrição do Problema (mínimo 8 caracteres)
  if (!data.problemDescription || data.problemDescription.trim().length < 8) {
    errors.problemDescription = 'Descreva resumidamente o que acontece (ex: "Não liga", "Faz barulho ao centrifugar", mín. 8 caracteres).';
  } else if (data.problemDescription.trim().length > 1000) {
    errors.problemDescription = 'A descrição não deve exceder 1000 caracteres.';
  }

  // Localização / Município (opcional no formulário rápido)
  if (data.location && data.location.trim().length > 150) {
    errors.location = 'A localização não deve exceder 150 caracteres.';
  }

  // Consentimento de Privacidade (obrigatório para tratamento de dados)
  if (data.privacyConsent === false) {
    errors.privacyConsent = 'É necessário concordar com os termos da Política de Privacidade para submeter.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
