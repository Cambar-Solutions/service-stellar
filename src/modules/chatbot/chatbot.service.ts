import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AskChatbotDto } from './dto/ask-chatbot.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private anthropic: Anthropic;
  private readonly systemContext = `
# Sistema de Gestión de Deudas con Blockchain Stellar - Asistente Levsek

Eres un asistente virtual experto del sistema de gestión de deudas "Levsek" que usa blockchain Stellar/Soroban.

## FUNCIONALIDADES PRINCIPALES

### 1. GESTIÓN DE DEUDORES
- Crear clientes/deudores con información básica
- Ver lista de deudores con saldo pendiente
- Cada deudor tiene wallet de Stellar generado automáticamente
- Historial completo de deudas y pagos

### 2. REGISTRO DE DEUDAS
- Los admins registran nuevas deudas a clientes
- Cada deuda incluye: monto, descripción, estado, hash de blockchain
- Se registran automáticamente en blockchain Stellar (Soroban)

### 3. SISTEMA DE PAGOS (NUEVO - MUY IMPORTANTE)

#### A. Pagos desde Vista Pública
- Los clientes acceden a /public/:siteId sin login
- Ven su deuda y pueden pagar con Stellar
- **IMPORTANTE:** Los pagos NO se descuentan inmediatamente
- Van a "Pendientes" esperando aprobación del admin

#### B. Pagos Pendientes
- Todos los pagos públicos crean un "pending_payment"
- Estado: pending, approved, rejected
- NO afectan la deuda hasta ser aprobados

#### C. Aprobación/Rechazo (Admin)
- **APROBAR:** El pago se registra, el saldo disminuye, se registra en blockchain
- **RECHAZAR:** El pago se marca como rechazado, la deuda NO cambia

#### D. Pagos Individuales
- Cada pago es un registro separado
- Si paga 200 dos veces, aparecen 2 pagos de 200 (NO se agrupan)

### 4. VISTA PÚBLICA
- URL: /public/:siteId
- Sin login requerido
- Muestra lista de deudores con saldo pendiente
- Los clientes pueden pagar con Stellar

### 5. BLOCKCHAIN STELLAR
- Testnet de Stellar
- Smart contract Soroban
- Cada transacción genera hash único
- Inmutabilidad y transparencia garantizadas

## FLUJOS DE TRABAJO

### FLUJO 1: Registrar deuda
1. Admin → "Agregar Deudor"
2. Selecciona cliente o crea nuevo
3. Ingresa monto y descripción
4. Sistema guarda en MySQL + blockchain

### FLUJO 2: Cliente paga
1. Cliente → /public/:siteId
2. Encuentra su nombre y hace clic en "Pagar"
3. Ingresa monto y referencia
4. Sistema crea pending_payment (NO descuenta todavía)
5. Estado: "En Revisión"

### FLUJO 3: Admin aprueba
1. Admin → "Pagos Pendientes"
2. Ve pago en revisión
3. Click "Aprobar"
4. Sistema: registra pago, descuenta saldo, registra en blockchain
5. Aparece como "Verificado"

### FLUJO 4: Admin rechaza
1. Admin → "Pagos Pendientes"
2. Click "Rechazar"
3. Sistema: marca como rechazado, NO modifica deuda

## PREGUNTAS FRECUENTES

**¿Por qué mi pago no se refleja?**
Es normal. Los pagos van a "Pendientes" y deben ser aprobados por el admin.

**¿Puedo pagar en partes?**
Sí, puedes hacer pagos parciales. Cada uno se registra individualmente.

**¿Qué pasa si rechazan mi pago?**
Tu deuda permanece igual. Debes contactar al admin para entender el motivo.

**¿Cómo elimino un deudor?**
Solo si tiene saldo = 0 y sin pagos registrados.

**¿Qué es el hash de blockchain?**
Identificador único de la transacción en Stellar. Comprobante inmutable.

## TU ROL
- Responde SIEMPRE en español
- Sé profesional pero amigable
- Máximo 200 palabras por respuesta
- Usa emojis ocasionalmente (✅ ❌ 💡 ⚠️ 📊)
- Estructura respuestas con:
  * Respuesta directa
  * Pasos numerados si es necesario
  * Tips o advertencias al final
- Si es algo fuera del sistema, indica que solo puedes ayudar con temas del sistema de deudas
`;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (apiKey && apiKey !== 'your-anthropic-api-key-here') {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
      });
      this.logger.log('✅ Chatbot initialized with Anthropic AI');
    } else {
      this.logger.warn('⚠️ Anthropic API key not configured. Chatbot will use fallback responses.');
    }
  }

  async askQuestion(askChatbotDto: AskChatbotDto): Promise<string> {
    const { message, history = [] } = askChatbotDto;

    this.logger.log(`📝 User question: ${message.substring(0, 50)}...`);

    // Si no hay API key, usar respuestas predefinidas (fallback)
    if (!this.anthropic) {
      return this.getFallbackResponse(message);
    }

    try {
      // Construir mensajes para Claude
      const messages = [
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: message,
        },
      ];

      // Llamar a Claude AI
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: this.systemContext,
        messages: messages,
      });

      const answer = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Lo siento, no pude procesar tu pregunta.';

      this.logger.log(`✅ Chatbot responded (${answer.length} chars)`);

      return answer;
    } catch (error) {
      this.logger.error('❌ Error calling Anthropic API:', error.message);
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Respuestas predefinidas cuando no hay API key de Anthropic
   */
  private getFallbackResponse(message: string): string {
    const msg = message.toLowerCase();

    if (msg.includes('pag') && (msg.includes('como') || msg.includes('cómo'))) {
      return `💳 **Cómo realizar un pago:**

1. Accede a la vista pública: /public/:siteId
2. Busca tu nombre en la lista
3. Haz clic en "Pagar"
4. Ingresa el monto a pagar
5. Agrega una referencia (opcional)
6. Haz clic en "Pagar con Stellar"

⚠️ **Importante:** Tu pago irá a "Pendientes" y debe ser aprobado por el administrador.`;
    }

    if (msg.includes('no se refleja') || msg.includes('no descuenta')) {
      return `📋 **¿Tu pago no se refleja?**

✅ Es completamente normal. Los pagos desde la vista pública van a "Pendientes" y deben ser aprobados por el administrador.

**Proceso:**
1. Cliente paga → "En Revisión"
2. Admin aprueba → "Verificado" y se descuenta
3. Admin rechaza → Pago rechazado, deuda no cambia

💡 Contacta al administrador para conocer el estado de tu pago.`;
    }

    if (msg.includes('aprobar') || msg.includes('aprobación')) {
      return `✅ **Aprobar un pago (Admin):**

1. Inicia sesión
2. Ve a "Pagos Pendientes"
3. Encuentra el pago "En Revisión"
4. Revisa monto, cliente y referencia
5. Haz clic en "Aprobar"

**Al aprobar:**
- El pago se registra en la deuda
- El saldo disminuye
- Se registra en blockchain Stellar
- Aparece como "Verificado"`;
    }

    if (msg.includes('rechazar') || msg.includes('rechazo')) {
      return `❌ **Rechazar un pago (Admin):**

1. Ve a "Pagos Pendientes"
2. Encuentra el pago
3. Haz clic en "Rechazar"
4. Confirma la acción

**Al rechazar:**
- El pago se marca como rechazado
- La deuda NO cambia
- NO se registra en blockchain
- El pago desaparece de pendientes

⚠️ La deuda original permanece intacta.`;
    }

    if (msg.includes('deuda') && (msg.includes('registrar') || msg.includes('crear'))) {
      return `📊 **Registrar una nueva deuda:**

1. Inicia sesión como administrador
2. Ve a "Agregar Deudor"
3. Selecciona cliente existente O crea uno nuevo
4. Ingresa el monto de la deuda
5. Agrega descripción/concepto
6. Haz clic en "Registrar"

✅ La deuda se guarda en MySQL y se registra automáticamente en blockchain Stellar.`;
    }

    if (msg.includes('eliminar') && msg.includes('deudor')) {
      return `🗑️ **Eliminar un deudor:**

Solo puedes eliminar si cumple AMBAS condiciones:
✅ Saldo = $0 (sin deudas)
✅ No tiene pagos registrados

Esto previene pérdida de información del historial financiero.`;
    }

    // Respuesta por defecto
    return `🤖 **Asistente Levsek**

Puedo ayudarte con:

💳 **Pagos** - Cómo pagar, aprobar, rechazar
📊 **Deudas** - Registrar, ver saldo, eliminar
🌐 **Vista Pública** - Acceso para clientes
⛓️ **Blockchain** - Qué es el hash, Stellar
🔧 **Problemas** - Errores comunes

¿Sobre qué tema necesitas ayuda?`;
  }
}
