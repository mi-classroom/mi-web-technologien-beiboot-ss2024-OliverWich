<script setup lang="ts">
import {RouterLink} from "vue-router"
</script>

<template>
  <main>
    <header>
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

      <div class="wrapper">
        <div class="greetings">
          <h1>Still Moving</h1>
          <h2>Create long exposure images from videos.</h2>
          <h3 class="italic">
            A Project build with
            <a href="https://bun.sh/" target="_blank" rel="noopener">Bun</a> /
            <a href="https://elysiajs.com/" target="_blank" rel="noopener">Elysia</a> and
            <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>
          </h3>
        </div>

        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/dashboard" class="text-accent hover:underline">Start!</RouterLink>
        </nav>
      </div>
    </header>

    <iframe style="height: 80vh; width: 100%" src="/swagger"/>
  </main>
</template>

<style scoped>
main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
}

@media (min-width: 1024px) {
  main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 2rem;
  }
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  text-decoration: underline;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid hsl(var(--ring));
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: 80px;
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h2 {
  font-size: 1.2rem;
}

.greetings h1 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1{
    text-align: left;
  }
}
</style>
