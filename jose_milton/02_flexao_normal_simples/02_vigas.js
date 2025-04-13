// 1 - Entrada de dados

// Propriedades dos materiais
const Propriedades_materiais = {
    fck: 20,  // MPa
    fyk: 500, // MPa
    Es: 200   //GPa
}

// Coeficientes parciais de segurança
const Coeficientes_seguranca = {
    gamac: 1.4,  // Concreto
    gamas: 1.15, // Aço
    gamaf: 1.4   // Solicitação
}

// Coeficiente de redistribuição dos momentos
const beta = 1

// Dimensões da seção
const dimensoes_secão = {
    b: 20,    // cm
    h: 50,    // cm
    d: 46,    // cm
    dlinha: 4 // cm
}

// Momento fletor de serviço
const Mk = 30 // MPa

// Parâmetros do diagrama retangular para o concreto e profundidade limite da linha neutra
let lambda, alfac, eu, qsiLimite // lambda, alfa c , deformação limite e qsi limite.
if (Propriedades_materiais.fck <= 50) {
    lambda = 0.8
    alfac =  0.85
    eu = 3.5
    qsiLimite = 0.8 * beta - 0.35
}
if (Propriedades_materiais.fck > 50) {
    lambda = 0.8 - ((Propriedades_materiais.fck - 50) / 400)
    alfac =  0.85 * (1 - ((Propriedades_materiais.fck - 50) / 200))
    eu = 2.6 + 35 *(((90 - Propriedades_materiais.fck) / 100) ** 4)
    qsiLimite = 0.8 * beta - 0.45
}

// 3) Conversão de unidades para kN e cm
Mk = Mk * 100
Propriedades_materiais.fck = Propriedades_materiais.fck / 10
Propriedades_materiais.fyk = Propriedades_materiais.fyk / 10
Propriedades_materiais.Es = Propriedades_materiais.Es * 100

// 4) Resistências e momento de cálculo
const fcd = Propriedades_materiais.fck / Coeficientes_seguranca.gamac
const sigma_cd = alfac * fcd
const fyd = Propriedades_materiais.fyk / Coeficientes_seguranca.gamas
const Md = Coeficientes_seguranca.gamaf * Mk

// 5) Parâmetro geométrico
const delta = dimensoes_secão.dlinha / dimensoes_secão.d

// 6) Momento limite 
const miLimite = lambda * qsiLimite * (1 - 0.5 * lambda * qsiLimite)

// 7) Momento reduzido solicitante
mi = Md / (dimensoes_secão.b * (dimensoes_secão.d ** 2) *sigma_cd)

// 8) Solução com armadura simples
