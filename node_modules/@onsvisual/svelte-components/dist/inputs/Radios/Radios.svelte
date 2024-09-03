<script>
  import Radio from "./Radio.svelte";

  /**
   * Unique ID for radio group (required)
   * @type {string}
   */
  export let id = "name";
  /**
   * Label for grouped inputs
   * @type {string}
   */
  export let label = "";
  /**
   * Binding for ID of selected option
   * @type {string}
   */
  export let value = null;
  /** (Optional) Define the radios as an array of {id, label, description?}
   * @type {array}
   */
  export let items = [];
  /**
   * Compact mode (no border)
   * @type {boolean}
   */
  export let compact = false;
</script>

{#if label}
  <p class="ons-radios__label">{label}</p>
{/if}
<div class="ons-radios__items">
  <slot />
  {#each items as item, i}
    <Radio
      id="{item.id}"
      label="{item.label}"
      description="{item.description}"
      groupId="{id}"
      compact="{compact}"
      bind:value="{value}"
      on:change
    />
  {/each}
</div>
