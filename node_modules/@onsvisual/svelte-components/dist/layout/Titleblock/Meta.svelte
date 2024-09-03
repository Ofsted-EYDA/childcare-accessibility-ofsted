<script>
  import { validDate, formatDate } from "../../js/utils.js";
  export let meta = null;
</script>

{#if Array.isArray(meta)}
  <dl
    class="ons-metadata metadata__list ons-grid ons-grid--gutterless ons-u-cf ons-u-mb-m"
    title="Dataset ID and release date information"
    aria-label="Dataset ID and release date information"
  >
    {#each meta as m, i}
      <div class="ons-grid__col ons-col-{m.col ? m.col : 12}@m" class:ons-u-mt-xs="{i !== 0}">
        <dt class="ons-metadata__term ons-u-mr-xs">{m.key}:</dt>
        <dd class="ons-metadata__value ons-u-f-no">
          {#if validDate(m.value)}
            <time datetime="{new Date(m.value).toISOString()}">{formatDate(m.value)}</time>
            {#if m.extra}{@html m.extra}{/if}
          {:else}
            {@html m.value}
          {/if}
        </dd>
      </div>
    {/each}
  </dl>
{/if}
