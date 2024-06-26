import { render, fireEvent } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import SpeciesInput from './SpeciesInput.svelte'

/**
 * @vitest-environment jsdom
 */

// problem with fire events, still havent solved it
describe('SpeciesInput', () => {
  it('adds species to customSpecies and displays error for invalid species', async () => {
    const { getByPlaceholderText, getByText } = render(SpeciesInput, { selectableSpecies: ['test species'], customSpecies: [], chooseAll: false })

    const input = getByPlaceholderText('Legg til art')
    await fireEvent.input(input, { target: { value: 'test species' } })
    await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(getByText('Test species')).toBeTruthy()

    await fireEvent.input(input, { target: { value: 'invalid species' } })
    await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(getByText('Art finnes ikke')).toBeTruthy()
  })
})
