<script>
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  const elements = writable(new Set());
  setContext("elements", elements);

  const allOpen = writable(false);
  setContext("allOpen", allOpen);

  function toggleAll() {
    $elements.forEach((el) => {
      el.open = !$allOpen;
    });
  }

  /**
   * Option to include a "show all" toggle above the accordion
   * @type {boolean}
   */
  export let showToggle = false;
</script>

<div id="accordion" class="ons-accordion">
  {#if showToggle}
    <button
      type="button"
      class="ons-btn ons-js-accordion-all ons-u-mb-s ons-btn--secondary ons-btn--small"
      on:click="{() => toggleAll()}"
    >
      <span class="ons-btn__inner ons-js-accordion-all-inner"
        ><span class="ons-btn__text">{$allOpen ? "Hide all" : "Show all"}</span>
      </span>
    </button>
  {/if}
  <slot />
</div>
