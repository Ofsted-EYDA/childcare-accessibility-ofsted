<script>
  /**
   * (Optional) attribution for the quote. If you leave this blank, you will just get an indented text block.
   * @type {string}
   */
  export let attribution = "";
</script>

<blockquote class="ons-quote">
  {#if attribution}
    <svg
      class="ons-svg-icon"
      viewBox="0 0 14 10"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      fill="currentColor"
    >
      <path
        d="M13.44.77h-3l-2 4v6h6v-6h-3l2-4zm-8 0h-3l-2 4v6h6v-6h-3l2-4z"
        transform="translate(-0.44 -0.77)"></path>
    </svg>
    <span class="ons-quote__text ons-u-fs-l"><slot /></span>
    <span class="ons-quote__ref">&mdash; {attribution}</span>
  {:else}
    <span class="ons-quote__text ons-u-fs-l"><slot /></span>
  {/if}
</blockquote>
