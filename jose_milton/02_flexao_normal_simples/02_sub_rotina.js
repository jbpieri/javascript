export function calcularSigmasdLinha(Es, Es, fyd) {
    // Trabalhar com o valor absoluto da deformação
    const ess = Math.abs(Es)

    // Deformação de escoamento de cálculo do aço
    const eyd = fyd / Es

    // Cálculo da tensão
    let sigmasd
    if (ess < eyd) {
        sigmasd = Es * ess
    }

    if (ess > eyd) {
        sigmasd = fyd
    }
    // Acertando o sinal da tensão
    if (Es < 0) {
        sigmasd = - sigmasd
    }
    return sigmasd
}