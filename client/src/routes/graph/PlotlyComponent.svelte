<script>
    import BarChartComponent from '../../lib/Diagrams/BarChartComponent.svelte'
    import PieChartComponent from '../../lib/Diagrams/PieChartComponent.svelte'
    import BoxPlotComponent from '../../lib/Diagrams/BoxPlottComponent.svelte'
    import HistogramComponent from '../../lib/Diagrams/HistogramComponent.svelte'
    import {
      dataForBarAndPieChart,
      dataForHistogramAndBoxplot
    } from '../../utils/plotlyData.js'

    export let type = 'bar' // The type of graph to display, 'barchart', 'piechart', 'boxplot' or 'histogram'
    export let plotData = new Map() // The data to be displayed in the graph
    export let dataType // The type of data to display, 'river' or 'station'
    export let aggregateData = false // Whether to aggregate data for rivers/stations
    export let species = [] // The species to display in the graph
    export let absoluteValues = true // Whether to display absolute values in the graph
    export let interval = 1 // The interval to display in the graph
    export let includeOthers // Whether to include 'others' category in the graph
    export let combineSpecies = false // Whether to combine species for each river/station in the graph

    let formattedData = new Map()

    $: if (plotData.size > 0 && dataType && species.length > 0) {
      formattedData = (type === 'barchart' || type === 'piechart')
        ? dataForBarAndPieChart(plotData, dataType, species, includeOthers, absoluteValues === 'absolute', aggregateData)
        : dataForHistogramAndBoxplot(type, plotData, dataType, species, interval, includeOthers, combineSpecies, aggregateData)
    }

</script>

{#if !plotData || plotData.size === 0}
    <p>Velg elv/stasjon for å se data</p>
{:else}
    <!-- Plot graph choosen by user -->
    {#if type === 'barchart'}
    <BarChartComponent plotData={formattedData} {absoluteValues}/>
    {:else if type === 'piechart'}
    <PieChartComponent plotData={formattedData}/>
    {:else if type === 'boxplot'}
    <BoxPlotComponent plotData={formattedData}/>
    {:else}
    <HistogramComponent plotData={formattedData}/>
    {/if}
{/if}

<style>
  p {
    padding-left: 15%;
    padding-right: auto;
    padding-bottom: 2em;
  }
</style>
