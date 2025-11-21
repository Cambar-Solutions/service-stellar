import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { AskChatbotDto } from './dto/ask-chatbot.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Post('ask')
  @ApiOperation({ summary: 'Ask chatbot a question about the system' })
  @ApiResponse({
    status: 200,
    description: 'Chatbot response',
    schema: {
      type: 'object',
      properties: {
        response: {
          type: 'string',
          example: '💳 **Cómo realizar un pago:** ...',
        },
      },
    },
  })
  async askQuestion(@Body() askChatbotDto: AskChatbotDto) {
    const response = await this.chatbotService.askQuestion(askChatbotDto);
    return { response };
  }
}
