const { body } = require("express-validator");

exports.createParticipantValidation = [
  body("name").notEmpty().withMessage("O nome é obrigatório."),
  body("username").notEmpty().withMessage("O username é obrigatório."),
  body("level").isInt({ min: 1 }).withMessage("O nível deve ser um número inteiro positivo."),
  body("email").isEmail().withMessage("Email inválido."),
  body("password_hash").notEmpty().withMessage("A password é obrigatória."),
  body("gender").isInt({ min: 0, max: 1 }).withMessage("Género inválido."),
  body("upload").optional().isInt().withMessage("Upload deve ser um número inteiro."),
];

