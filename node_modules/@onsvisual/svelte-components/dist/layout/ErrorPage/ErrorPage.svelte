<script>
  /**
   * Pass the "page" store from "$app/stores" in any Svelte Kit project
   * @type {any}
   */
  export let page = null;
  /**
   * (Optional) Explicitly pass a page status number, eg. 404 or 500.
   * @type {number}
   */
  export let status = $page ? $page?.status : null;
  /**
   * (Optional) Explicitly pass a page status message.
   * @type {string}
   */
  export let message = $page ? $page?.error?.message : "";
</script>

<div class="ons-page__container ons-container">
  <div class="ons-grid">
    <div class="ons-grid__col ons-col-12@m">
      <main id="main-content" class="ons-page__main">
        {#if status === 404}
          <h1>{message || "Page not found"}</h1>
          <p>If you entered a web address, check it is correct.</p>
          <p>If you pasted the web address, check you copied the whole address.</p>
          <p>
            If the web address is correct or you selected a link or button, <a
              href="https://www.ons.gov.uk/feedback">contact us</a
            > for more help.
          </p>
        {:else}
          <h1>{message || "Sorry, there is a problem with the service"}</h1>
          <p>
            If you continue to experience problems with this service, please <a
              href="https://www.ons.gov.uk/feedback">contact us</a
            >.
          </p>
        {/if}
      </main>
    </div>
  </div>
</div>
