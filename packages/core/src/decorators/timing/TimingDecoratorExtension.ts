import type { DIDComV1BaseMessageConstructor } from '../../agent/didcomm/v1/DIDCommV1BaseMessage'

import { Expose, Type } from 'class-transformer'
import { IsInstance, IsOptional, ValidateNested } from 'class-validator'

import { TimingDecorator } from './TimingDecorator'

export function TimingDecorated<T extends DIDComV1BaseMessageConstructor>(Base: T) {
  class TimingDecoratorExtension extends Base {
    /**
     * Timing attributes of messages can be described with the ~timing decorator.
     */
    @Expose({ name: '~timing' })
    @Type(() => TimingDecorator)
    @ValidateNested()
    @IsInstance(TimingDecorator)
    @IsOptional()
    public timing?: TimingDecorator

    public setTiming(options: Partial<TimingDecorator>) {
      this.timing = new TimingDecorator(options)
    }
  }

  return TimingDecoratorExtension
}
