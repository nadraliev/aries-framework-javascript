import type { DIDCommV2MessageParams } from '../../../agent/didcomm'

import { ValueTransferMessage } from '@value-transfer/value-transfer-lib'
import { Type } from 'class-transformer'
import { Equals, IsInstance, ValidateNested } from 'class-validator'

import { DIDCommV2Message } from '../../../agent/didcomm'

type RequestWitnessedMessageParams = DIDCommV2MessageParams & {
  body: ValueTransferMessage
}

export class RequestWitnessedMessage extends DIDCommV2Message {
  public constructor(options?: RequestWitnessedMessageParams) {
    super(options)
  }

  @Equals(RequestWitnessedMessage.type)
  public readonly type = RequestWitnessedMessage.type
  public static readonly type = 'https://didcomm.org/vtp/1.0/payment-request-witnessed'

  @Type(() => ValueTransferMessage)
  @ValidateNested()
  @IsInstance(ValueTransferMessage)
  public body!: ValueTransferMessage
}
