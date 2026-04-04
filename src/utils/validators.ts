// Valida se o CPF é matematicamente válido (cálculo dos dígitos verificadores)
export const isValidCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/[^\d]/g, "");

    // Verifica tamanho e se todos os números são iguais (ex: 111.111.111-11)
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
        return false;
    }

    let sum = 0;
    let rest;

    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }
    rest = (sum * 10) % 11;

    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }
    rest = (sum * 10) % 11;

    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
};

//validação basica de RG
export const isValidRG = (rg: string): boolean => {
    const cleanRG = rg.replace(/[^a-zA-Z0-9]/g, "");
    return cleanRG.length >= 7 && cleanRG.length <= 9;
}
// validação basica de data de nascimento
export const isOver18 = (birthDateString: string): boolean => {
    if (!birthDateString) return false;

    const today = new Date();
    const birthDate = new Date(birthDateString);

    let age = today.getFullYear() - birthDate.getUTCFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth()

    // Se o mês atual for anterior ao mês do aniversário, ou se for o mesmo mês mas o dia ainda não chegou, diminui 1 ano
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 18;


}