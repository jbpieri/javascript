import { calcularSigmasdLinha } from "./02_sub_rotina"

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
let Mk = 30 // kN.m

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
const mi = Md / (dimensoes_secão.b * (dimensoes_secão.d ** 2) *sigma_cd)

// 8) Solução com armadura simples
let qsi, As, Aslinha 
if (mi <= miLimite) {
    qsi = (1 - Math.sqrt(1 - 2 * mi)) / lambda
    As = lambda * qsi * dimensoes_secão.b * dimensoes_secão.d * (sigma_cd / fyd)
    Aslinha = 0
}

// 9) Solução com armadura dupla
let esLinha
if (mi > miLimite) {
    const qsia = eu / (eu + 10)
    if (qsiLimite < qsia) {
        throw new Error('Você deve aumentar as dimensões da seção transversal')
    }
    if (qsiLimite <= delta) {
        throw new Error('Armadura de compressão tracionada, você deve aumentar as dimensões da seção transversal')
    }

    // Tensão na armadura de compressão
    esLinha = eu * ((qsiLimite - delta) / qsiLimite)

    // Chamar uma sub-rotina para calcular a tensão sigmasdLinha
    const sigmasdLinha = calcularSigmasdLinha(Propriedades_materiais.Es, esLinha, fyd)

    // Calcular a armadura da seção superior
    Aslinha = ((mi - miLimite) * dimensoes_secão.b * dimensoes_secão.d * sigma_cd) / ((1 - delta ) * sigmasdLinha)

    As = (lambda * qsiLimite + ((mi - miLimite) / (1 - delta))) * (dimensoes_secão.b * dimensoes_secão.d * (sigma_cd / fyd))

    // Armadura mínima
    // Voltar fck e fyd para MPa
    Propriedades_materiais.fck =10 * Propriedades_materiais.fck
    Propriedades_materiais.fyk = 10 * fyd

    let romin
    if (Propriedades_materiais.fck <= 50) {
        romin = (0.078 * (Propriedades_materiais.fck ** (2/3))) / fyd
    }

    if (Propriedades_materiais.fck > 50) {
        romin = (0.5512 * Math.log(1 + 0.11 * Propriedades_materiais.fck))  / fyd
    }

    if (romin < (0.15 / 100)) {
        romin = 0.15 / 100
    }

    const Asmin = romin * dimensoes_secão.b * dimensoes_secão.d

    if (As < Asmin) {
        As = Asmin
    }
    console.log({
        As: As,
        Aslinha: Aslinha
    })
}