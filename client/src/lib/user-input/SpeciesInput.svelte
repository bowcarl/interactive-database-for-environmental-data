<script>
  import { validateText } from '../../utils/validation'

  export let selectableSpecies = [] // Get species the user can choose from

  export let chooseAll = true // If the user wants to choose all species
  export let customSpecies = [] // Custom species the user has chosen
  export let includeOthers = false // If the user wants to include 'others' species as its own category
  export let showIncludeOthers = false // If the 'others' category option should be displayed

  let inputSpecies = ''
  let showSuggestions = false
  let showError = ''
  let suggestSpecies = [] // Species to suggest to the user

  /**
   * Adds the species the user has written in the input field to the custom species
   */
  function addSpecies () {
    const lowercaseInputSpecies = inputSpecies.toLowerCase()

    // If the input is empty, do nothing
    if (lowercaseInputSpecies.trim().length === 0) {
      return
    }

    // Check if the input is validated
    if (!validateText(inputSpecies)) {
      return
    }

    // If the input is not a selectable species, display an error
    if (!selectableSpecies.includes(lowercaseInputSpecies)) {
      displayError('Art finnes ikke')
      return
    }

    // If the input is already chosen, display an error
    if (customSpecies.includes(lowercaseInputSpecies)) {
      displayError('Art allerede valgt')
      return
    }

    // Remove error message, add the species to the custom species and reset the input field
    displayError('')
    customSpecies = [...customSpecies, lowercaseInputSpecies]
    inputSpecies = ''
  }

  /**
   * Displays an error message to the user
   * @param {string} message - The message to display
   */
  function displayError (message) {
    showError = message
  }

  /**
   * Removes a species from the custom species
   * @param {string} speciesToRemove - The species to remove
   */
  function removeSpecies (speciesToRemove) {
    customSpecies = customSpecies.filter((species) => species !== speciesToRemove)
  }

  /**
   * Handles the keydown event on the input field,
   * adds a species if the user presses enter
   * @param {KeyboardEvent} event - The event
   */
  function handleKeydown (event) {
    if (event.key === 'Enter') {
      addSpecies()
    }
  }

  /**
   * Capitalizes the first letter of a string
   * @param {string} string - The string to capitalize
   * @returns {string} - The string with the first letter capitalized
   */
  function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  // Get the species to suggest to the user based on the input
  $: suggestSpecies = selectableSpecies.filter((species) =>
    species.includes(inputSpecies.toLowerCase()) &&
    !customSpecies.includes(species)
  )

  // If the input is not empty and there are suggestions, display them
  $: showSuggestions = inputSpecies.trim().length > 0 && suggestSpecies.length > 0

</script>

<!-- Input for choosing all or custom species -->
<label for='all'>
  <input type='radio' id='all' name='all' bind:group={chooseAll} value={true}> Velg alle
</label>
<label for='custom'>
  <input type='radio' id='custom' name='custom' bind:group={chooseAll} value={false}> Egendefinert
</label>

<!-- Input for handling custom species -->
{#if !chooseAll}
  <div class='inputContainer'>
    <!-- Input for adding a species to the custom species-->
    <input
      type='text'
      bind:value={inputSpecies}
      on:keydown={handleKeydown}
      placeholder='Legg til art'/>
    <button on:click={addSpecies} class='smallButton'>+</button>

    <!-- Error message to display to the user -->
    {#if showError}
      <p>{showError}</p>
    {/if}

    <!-- Suggestions based on user input -->
    {#if showSuggestions}
      <div class='suggestions'>
        {#each suggestSpecies as species}
          <button class='suggestSpecies' on:click={() => { inputSpecies = capitalizeFirstLetter(species); addSpecies() }}>
            {capitalizeFirstLetter(species)}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Custom species choosen by user -->
  {#if customSpecies.length > 0}
    <p>Valgte arter:</p>
    <ul>
      {#each customSpecies as species}
        <li>{capitalizeFirstLetter(species)} <button on:click={() => removeSpecies(species)} class='smallButton'>x</button></li>
      {/each}
    </ul>

    <!-- Option to include 'others' category -->
    {#if showIncludeOthers}
      <label>
        <input type='checkbox' bind:checked={includeOthers}> Grupper og vis ikke valgte arter sammen
      </label>
    {/if}
  {/if}
{/if}

<style>
  label {
    display: block;
    padding: 0.5em;
    font-size: 1.2rem;
    cursor: pointer;
    border-radius: 0.5em;
  }

  /* Show when a user hovers over the label */
  label:hover {
    background-color: var(--PCOLOR);
    color: white;
  }

  input[type='radio'] {
    /* Make the input radio button larger */
    transform: scale(1.25);
  }

  input[type='text'] {
    width: 60%;
    font-size: 16px;
    padding: 0.5em;
    margin: 0.5em 0;
    border-radius: 0.5em;
  }

  .smallButton {
    padding: 0.5em;
    margin: 0.5em 0;
    border-radius: 0.5em;
    cursor: pointer;
  }

  .smallButton:hover {
    background-color: var(--PCOLOR);
    color: white;
  }

  ul {
    list-style: none;
    padding: 0;
    margin-top: 0;
    margin-left: 0.5em;
  }

  .inputContainer {
    position: relative;
    width: 100%;
  }

  .suggestions {
    position: absolute;
    width: 60%;
    max-height: 150px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 0.5em;
    z-index: 10;
  }

  .suggestSpecies {
    display: block;
    width: 100%;
    padding: 0.5em;
    text-align: left;
    border: none;
    background: none;
    padding: 0.5em;
    font-size: 14px;
  }

  /* Show when a user hovers over the li */
  .suggestSpecies:hover {
    background-color: #435768;
    color: white;
  }
</style>
