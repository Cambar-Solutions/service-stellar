export const stringConstants = {
  noFileUploaded: 'No file uploaded',
  invalidFileType: 'Invalid file type',
  duplicatedEmailAtRow: 'Duplicated email in excel row ',
  missingFieldsAtRow: 'Missing fields in excel row ',
  invalidRoleAtRow: 'Invalid role at row ',
  incorrectAuth: 'Incorrect e-mail or password.',
  duplicateRecord: 'This record already exists.',
  duplicateUser: 'This user already exists',
  duplicateUserAtRow: 'User already exists in excel row ',
  duplicateRole: 'This role already exists',
  duplicateCardUUID: 'The UUID already exists',
  existDefinitiveSolution: 'Already exists a definitive solution',
  existProvisionalSolution: 'Already exists a provisional solution',
  quantityOfUserExceeded: 'Quantity of site user exceeded',
  codeExpired: 'The code has expired',
  wrongResetCode: 'Wrong reset code',
  emailIsMissing: 'The e-mail is missing',
  duplicateLevelMachineId: 'A record with that level machine id already exists',
  resetPasswordEmailSubject: 'Reset Your Password - OSM',
  welcomeEmailSubject: 'Welcome to Our Platform!',
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  none: 'None',

  //Roles
  SUPER_ADMIN: 'SUPER_ADMIN',
  DIRECTOR: 'DIRECTOR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  
  //Status
  STATUS_ACTIVE: 'ACTIVE',
  STATUS_INACTIVE: 'INACTIVE',
  STATUS_OPEN: 'OPEN',
  STATUS_CLOSED: 'CLOSED',
  STATUS_PENDING: 'PENDING',
  STATUS_SENT: 'SENT',
  STATUS_DELIVERED: 'DELIVERED',
  STATUS_READ: 'READ',
  STATUS_FAILED: 'FAILED',
  STATUS_RECEIVED: 'RECEIVED',

  userNotFound: 'User not found',
  brandNotFound: 'Brand not found',
  categoryNotFound: 'Category not found',
  productNotFound: 'Product not found',
  mediaNotFound: 'Media not found',
  landingNotFound: 'Landing not found',
  brandCategoryNotFound: 'Brand category not found',
  userAddressNotFound: 'User address not found',
  subcategoryNotFound: 'Subcategory not found',
  colorNotFound: 'Color not found',
  sizeMstrNotFound: 'Size mstr not found',
  sizeDetailNotFound: 'Size detail not found',
  productColorSizeDetailNotFound: 'Product color size detail not found',
  orderMstrNotFound: 'Order mstr not found',
  orderDetailNotFound: 'Order detail not found',
  billNotFound: 'Bill not found',
  whatsappNotFound: 'Whatsapp not found',
  cartNotFound: 'Cart not found',
  companyNotFound: 'Company not found',
  siteNotFound: 'Site not found',
  siteStyleNotFound: 'Site style not found',
  customerNotFound: 'Customer not found',
  reservationNotFound: 'Reservation not found',
  promptNotFound: 'Prompt not found',
  exampleNotFound: 'Example not found',
  notFound: 'Not found',

  //sql errors
  INSERT_DATA_ERROR: 'INSERT_DATA_ERROR',
  TABLE_NOT_FOUND: 'TABLE_NOT_FOUND',
  UNHANDLED_SQL_ERROR: 'UNHANDLED_SQL_ERROR',
  
  SALT_ROUNDS: 10,
  OS_ANDROID: 'ANDROID',
  OS_IOS: 'IOS',
  OS_WEB: 'WEB',
  FILE_TYPE_IMAGE: 'IMAGE',
  FILE_TYPE_PDF: 'PDF',
  FILE_TYPE_VIDEO: 'VIDEO',
  FILE_TYPE_OTHER: 'OTHER',
  ENTITY_TYPE_PRODUCT: 'PRODUCT',
  ENTITY_TYPE_CATEGORY: 'CATEGORY',
  ENTITY_TYPE_LANDING: 'LANDING',

  ORDER_HEADER: (orderId: any) => `📦 *Detalles de tu Orden #${orderId}* 📦\n\nAquí tienes un resumen de tu compra. Te enviaremos los documentos detallados en un momento.`,
  IA_PROMPTS: {
    CHAT_INSTRUCTIONS: `Eres un asistente virtual de atención al cliente amigable y profesional.

INSTRUCCIONES:
- Responde siempre en español
- Sé conciso pero amable (máximo 2-3 oraciones)
- Usa un tono cálido y cercano
- Usa emojis apropiados
- No te refieras a ti mismo como "IA" o "bot"
- Si no conoces el nombre del cliente, pregúntalo naturalmente

Tu objetivo es ayudar al cliente de manera útil y profesional.`,

    IMAGE_ANALYSIS: `Analiza esta imagen{text}. Describe detalladamente lo que ves y proporciona información relevante.`,

    AUDIO_TRANSCRIPTION: "Transcribe el siguiente audio. Responde únicamente con el texto transcrito.",

    DOCUMENT_ANALYSIS: `Analiza este documento ({fileName}) y proporciona un resumen de su contenido.`
  },

  TRIVIAL_MESSAGE_PATTERNS: [
    /^(ja+){1,}$/i, 
    /^ok(ay)?\.?$/i, 
    /^si?\.?$/i, 
    /^no\.?$/i, 
    /^gracias\.?$/i, 
    /^por favor\.?$/i,
    /^\s*$/, // Mensajes vacíos o solo espacios en blanco
    /^(?:no hay ninguna acción|necesito más contexto|se requiere más contexto|información para determinar|es solo una expresión de|estos mensajes parecen ser|difícil determinar su significado|necesitas ayuda para interpretar|no puedo|mi función es|parece ser|sin contexto|debo realizar|qué debería hacer|analiza el siguiente mensaje|requiere aclaración|para responder a la pregunta|the customer sent|no further information available|more context is needed|esta respuesta necesita|este mensaje requiere|expressing sadness or disappointment|requires more information|i need to know what product or service|to get that information|there is no information available to me in this context to fulfill this request|the customer message|more context is needed to understand the customer's message)/i // Patrón genérico y robusto para meta-comentarios y solicitudes de información
  ],

  IA_RESPONSES: {
    TRIVIAL_ACKNOWLEDGMENT: "Entendido. 😊 ¿Hay algo más en lo que pueda ayudarte?"
  }
};
