import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import Filter from './Filter.svelte'

/**
 * @vitest-environment jsdom
 */

describe('Filter', () => {
  it('renders child components', () => {
    const { getByText } = render(Filter, { props: { selectableSpecies: [] } })

    // Checking if the child components are rendered
    expect(getByText('Type data')).not.toBeNull()
    expect(getByText('Dato')).not.toBeNull()
    expect(getByText('Art')).not.toBeNull()
  })
})
