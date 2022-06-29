import type { ValueTransferStateRecord } from '../repository/ValueTransferStateRecord'
import type { WitnessStateRecord } from '../repository/WitnessStateRecord'
import type { PartyState, StorageInterface, WitnessState } from '@sicpa-dlab/value-transfer-protocol-ts'

import { Lifecycle, scoped } from 'tsyringe'

import { ValueTransferStateRepository } from '../repository/ValueTransferStateRepository'
import { WitnessStateRepository } from '../repository/WitnessStateRepository'

@scoped(Lifecycle.ContainerScoped)
export class ValueTransferStateService implements StorageInterface {
  private valueTransferStateRepository: ValueTransferStateRepository
  private witnessStateRepository: WitnessStateRepository
  private valueTransferStateRecord?: ValueTransferStateRecord
  private witnessStateRecord?: WitnessStateRecord

  public constructor(
    valueTransferStateRepository: ValueTransferStateRepository,
    witnessStateRepository: WitnessStateRepository
  ) {
    this.valueTransferStateRepository = valueTransferStateRepository
    this.witnessStateRepository = witnessStateRepository
  }

  public async getPartyState(): Promise<PartyState> {
    console.time('ValueTransferStateService.getPartyState')
    try {
      if (!this.valueTransferStateRecord) {
        this.valueTransferStateRecord = await this.valueTransferStateRepository.getSingleByQuery({})
      }
      return this.valueTransferStateRecord.partyState
    } finally {
      console.timeEnd('ValueTransferStateService.getPartyState')
    }
  }

  public async storePartyState(partyState: PartyState): Promise<void> {
    console.time('ValueTransferStateService.storePartyState')
    try {
      const record = await this.valueTransferStateRepository.getSingleByQuery({})
      record.partyState = partyState
      await this.valueTransferStateRepository.update(record)
      this.valueTransferStateRecord = record
    } finally {
      console.timeEnd('ValueTransferStateService.storePartyState')
    }
  }

  public async getWitnessState(): Promise<WitnessState> {
    console.time('ValueTransferStateService.getWitnessState')
    try {
      if (!this.witnessStateRecord) {
        this.witnessStateRecord = await this.witnessStateRepository.getSingleByQuery({})
      }
      return this.witnessStateRecord.witnessState
    } finally {
      console.timeEnd('ValueTransferStateService.getWitnessState')
    }
  }

  public async storeWitnessState(witnessState: WitnessState): Promise<void> {
    console.time('ValueTransferStateService.storeWitnessState')
    try {
      const record = await this.witnessStateRepository.getSingleByQuery({})
      record.witnessState = witnessState
      await this.witnessStateRepository.update(record)
      this.witnessStateRecord = record
    } finally {
      console.timeEnd('ValueTransferStateService.storeWitnessState')
    }
  }
}
