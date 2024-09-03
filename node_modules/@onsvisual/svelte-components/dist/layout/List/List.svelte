<script>
  import { onMount } from "svelte";

  /**
   * Type of list
   * @type {"bullet"|"dash"|"number"|"bare"}
   */
  export let mode = "bullet"; // dash | bullet | number | bare

  let el;

  onMount(() => {
    [...el.children].forEach((c) => {
      if (c.nodeName === "LI") c.className = "ons-list__item";
    });
  });
</script>

{#if mode === "number"}
  <ol class="ons-list" bind:this="{el}">
    <slot />
  </ol>
{:else}
  <ul
    class="ons-list"
    class:ons-list--dashed="{mode === 'dash'}"
    class:ons-list--bare="{mode === 'bare'}"
    bind:this="{el}"
  >
    <slot />
  </ul>
{/if}
