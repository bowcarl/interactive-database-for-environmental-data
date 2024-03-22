import { amountOfFishInObservations } from './calculateData.js'
import { getObservationsForRiver } from './dataManager.js'
import { addFeedbackToStore } from './addFeedbackToStore.js'
import { FEEDBACK_TYPES, FEEDBACK_CODES, FEEDBACK_MESSAGES } from '../constants/feedbackMessages.js'

/**
 * Creates data which can be used in a plotly bar or pie chart
 * Takes in either a map of rivers or stations to calculate the data for
 * @param {Map<number, object>} observationPoints - Map of either river or station objects
 * @param {string} dataType - Either 'river' or 'station'
 * @param {string[]} species - An array of species to include in the data
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @returns {Map<string, Map<string, number>>} - Map of rivers or stations with count of each species
 */
export function dataForBarAndPieChart (observationPoints, dataType, species, includeOthers) {
  try {
    // Return the species count for rivers or stations based on datatType
    if (dataType === 'river') {
      return speciesCountForObservationPoints(
        observationPoints,
        species,
        includeOthers,
        river => getObservationsForRiver(river), // Use imported function to get observations from rivers
        river => `${river.name} ${river.startDate}`
      )
    } else {
      return speciesCountForObservationPoints(
        observationPoints,
        species,
        includeOthers,
        station => station.observations, // Simply get observations directly from stations
        station => `${station.name} ${station.date}`
      )
    }
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.ERROR_PLOTTING_DATA)
    return new Map()
  }
}

/**
 * Counts amount of each species under each observation point (river or station)
 * @param {Map<number, ObservationPoint>} observationPoints - Map of observationPoints (rivers or stations)
 * @param {string[]} allSpecies - An array of species to include in the data
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @param {Function} getObservations - Function to get observations from an observationPoint
 * @param {Function} getDisplayName - Function to get display name from an observationPoint
 * @returns {Map<string, Map<string, number>>} - Map of observationPoints with count of each species
 */
function speciesCountForObservationPoints (observationPoints, allSpecies, includeOthers, getObservations, getDisplayName) {
  const speciesCountForPoints = new Map()

  // For each observationPoint, get the observations and group them by species
  Array.from(observationPoints.values()).forEach(observationPoint => {
    // Get the observations from the observationPoint
    const observations = getObservations(observationPoint)

    // Get the species count for the observations
    const speciesCount = getObservationSpeciesCount(observations, allSpecies, includeOthers)

    // Save the species count for the observationPoint
    speciesCountForPoints.set(getDisplayName(observationPoint), speciesCount)
  })

  return speciesCountForPoints
}

/**
 * Get the count of each species in the observations
 * @param {object[]} observations - An array of observations
 * @param {string[]} allSpecies - An array of all species to include in the data
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @returns {Map<string, number>} - Map of each species with their count
 */
function getObservationSpeciesCount (observations, allSpecies, includeOthers) {
  const speciesCount = new Map()

  // Find and save the amount of fish for each species
  allSpecies.forEach(species => {
    const speciesObservations = observations.filter(observation => observation.species === species)
    const count = amountOfFishInObservations(speciesObservations)

    speciesCount.set(species, count)
  })

  // If 'others' should be included, find and save the amount of fish for all other species
  if (includeOthers) {
    const otherSpecies = observations.filter(observation => !allSpecies.includes(observation.species))
    const count = amountOfFishInObservations(otherSpecies)

    speciesCount.set('others', count)
  }

  // Return the map with the species and their count
  return speciesCount
}

/**
 * Creates data which can be used in a plotly histogram or box plot
 * Takes in either a map of rivers or stations to calculate the data for
 * @param {Map<number, ObservationPoint>} observationPoints - Map of either river or station objects
 * @param {string} dataType - Either 'river' or 'station'
 * @param {string[]} species - An array of species to include in the data
 * @param {number} interval - The interval in cm to group the data by
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @param {boolean} combineSpecies - Whether to combine the data for all species in a river or station
 * @returns {Map<string, Map<string, number>>} - Map of rivers or stations with count of each species
 */
export function dataForHistogramAndBoxplot (observationPoints, dataType, species, interval, includeOthers = false, combineSpecies = false) {
  try {
    if (dataType === 'river') {
      return intervalCountForObservationPoints(
        observationPoints,
        species,
        interval,
        includeOthers,
        combineSpecies,
        river => getObservationsForRiver(river), // Use imported function to get observations from rivers
        river => `${river.name} ${river.startDate}`
      )
    } else {
      return intervalCountForObservationPoints(
        observationPoints,
        species,
        interval,
        includeOthers,
        combineSpecies,
        station => station.observations, // Simply get observations directly from stations
        station => `${station.name} ${station.date}`
      )
    }
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.ERROR_PLOTTING_DATA)
    return new Map()
  }
}

/**
 * Counts the observations in given intervals for observationPoints (river or station)
 * @param {Map<number, ObservationPoint>} observationPoints - Map of observationPoints (river or station)
 * @param {string[]} allSpecies - An array of species to include in the data
 * @param {number} interval - The interval in cm to group the data by
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @param {boolean} combineSpecies - Whether to combine the data for all species in an observationPoint
 * @param {Function} getObservations - Function to get observations from an observationPoint
 * @param {Function} getDisplayName - Function to get display name from an observationPoint
 * @returns {
 * Map<string, { count: number[], intervals: number[], interval: number }>
 * } - Map of observationPoints with count of each species in intervals
 */
function intervalCountForObservationPoints (observationPoints, allSpecies, interval, includeOthers, combineSpecies, getObservations, getDisplayName) {
  const allSpeciesIntervals = new Map()

  // For each observationPoint, get the observations and group them by species
  Array.from(observationPoints.values()).forEach(observationPoint => {
    // Get the observations from the observationPoint
    const observations = getObservations(observationPoint)

    // Get the species length intervals for the observations
    const speciesIntervals = getObservationSpeciesIntervals(observations, allSpecies, interval, includeOthers, combineSpecies)

    // Add the species length intervals to the total
    speciesIntervals.forEach((value, key) => {
      allSpeciesIntervals.set(`${getDisplayName(observationPoint)} - ${key}`, value)
    })
  })

  return allSpeciesIntervals
}

/**
 * Get the amount of fish in intervals for each species in the observations
 * @param {object[]} observations - An array of observations
 * @param {string[]} allSpecies - An array of all species to include in the data
 * @param {number} interval - The interval in cm to group the data by
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @param {boolean} combineSpecies - Whether to combine the data for all species in a river or station
 * @returns {
 * Map<string, { count: number[], intervals: number[], interval: number }>
 * } - Map of each species with their count in intervals
 */
function getObservationSpeciesIntervals (observations, allSpecies, interval, includeOthers, combineSpecies) {
  const speciesIntervals = new Map()

  // If species should be combined, find the amount of fish for all species and return this
  if (combineSpecies) {
    const intervals = getIntervalsForObservations(observations, interval)
    speciesIntervals.set('sum', intervals)
    return speciesIntervals
  }

  // Find the amount of fish for each species
  allSpecies.forEach(species => {
    const speciesObservations = observations.filter(observation => observation.species === species)
    const intervals = getIntervalsForObservations(speciesObservations, interval)

    speciesIntervals.set(species, intervals)
  })

  // If 'others' should be included, find the amount of fish for all other species
  if (includeOthers) {
    const otherSpecies = observations.filter(observation => !allSpecies.includes(observation.species))
    const intervals = getIntervalsForObservations(otherSpecies, interval)

    speciesIntervals.set('others', intervals)
  }

  return speciesIntervals
}

/**
 * Counts the observations in intervals, and returns the count with the intervals
 * @param {Observation[]} observations - The observations to group by interval
 * @param {number} interval - The interval in cm to group the data by
 * @returns {{
 * count: number[], intervals: number[], interval: number
 * }} - The count of observations in each interval
 */
function getIntervalsForObservations (observations, interval) {
  // If there are no observations, return empty data
  if (observations.length === 0) {
    return { count: [], intervals: [], interval }
  }

  // Find the minimum and maximum length of the observations, rounded down to the nearest interval
  const lengths = observations.map(observation => observation.length)
  const min = Math.floor(Math.min(...lengths) / interval) * interval
  const max = Math.floor(Math.max(...lengths) / interval) * interval

  // Create the intervals
  const intervals = []
  for (let i = min; i <= max; i += interval) {
    intervals.push(i)
  }

  // Count the observations in each interval
  const count = intervals.map(interval =>
    observations.filter(observation =>
      observation.length >= interval && observation.length < interval + interval
    ).length)

  // Shift each interval to the middle of the interval for placing the bars in a histogram
  intervals.forEach((_, index) => {
    intervals[index] = intervals[index] + interval / 2
  })

  return { count, intervals, interval }
}
