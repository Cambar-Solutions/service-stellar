import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

export class ChatMessage {
  @ApiProperty({ description: 'Role of the message sender', enum: ['user', 'assistant'] })
  @IsString()
  role: string;

  @ApiProperty({ description: 'Content of the message' })
  @IsString()
  content: string;
}

export class AskChatbotDto {
  @ApiProperty({ description: 'User question', example: '¿Cómo realizar un pago?' })
  @IsString()
  @MinLength(1)
  message: string;

  @ApiProperty({
    description: 'Conversation history (last 10 messages)',
    type: [ChatMessage],
    required: false,
  })
  @IsArray()
  @IsOptional()
  history?: ChatMessage[];
}
