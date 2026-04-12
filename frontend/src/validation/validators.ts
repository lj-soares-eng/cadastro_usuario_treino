/* Expressão regular para validar e-mail */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Valores mínimos e máximos para nome e senha */
export const NAME_MIN = 2
export const NAME_MAX = 40
export const PASSWORD_MIN = 6
export const PASSWORD_MAX = 20

/* Tipo de dado para as regras de validação */
type Rule = {test: boolean, message: string}

/* Função auxiliar para pegar o primeiro erro de uma lista de regras*/ 
export function getFirstError(rules: Rule[]): string | undefined{
  return rules.find(rule => rule.test)?.message
}

/* Função para validar o campo de nome */
export const validateNameField = (name: string) => {
    return getFirstError([
        {test: !name, message: `Informe o nome`},
        {test: name.length < NAME_MIN, message: `Mínimo de ${NAME_MIN} caracteres`},
        {test: name.length > NAME_MAX, message: `Máximo de ${NAME_MAX} caracteres`}
    ])
}

/* Função para validar o campo de e-mail */
export const validateEmailField = (email: string) => {
    const trimmed = email.trim()
    return getFirstError([
        {test: !trimmed, message: `Informe o e-mail`},
        {test: !EMAIL_RE.test(trimmed), message: `E-mail inválido`}
    ])
}

/* Função para validar o campo de senha */
export const validatePasswordField = (password: string) => {
    return getFirstError([
        {test: !password, message: `Informe a senha`},
        {test: password.length < PASSWORD_MIN, message: `Mínimo de ${PASSWORD_MIN} caracteres`},
        {test: password.length > PASSWORD_MAX, message: `Máximo de ${PASSWORD_MAX} caracteres`}
    ])   
}

/* Função para validar o campo de confirmação de senha */
export const validateConfirmPasswordField = (confirmPassword: string, password: string) => {
    return getFirstError([
        {test: !confirmPassword, message: `Confirme a senha`},
        {test: confirmPassword !== password, message: `As senhas não coincidem`}
    ])
}
