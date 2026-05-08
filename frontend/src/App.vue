<template>
  <div id="app">
    <nav>
      <div class="nav-inner">
        <span class="nav-brand">🍹 Cocktail Bar</span>
        <ul>
          <li><router-link to="/">List</router-link></li>
          <li><router-link to="/new">New Cocktail</router-link></li>
        </ul>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
    <ToastMessage />
  </div>
</template>

<script>
import ToastMessage from "@/components/toast.vue";

export default {
  name: "App",
  components: { ToastMessage },
};
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Segoe UI", sans-serif;
  background: #0f0f1a;
  color: #e8e0d5;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

nav {
  background: #1a1a2e;
  border-bottom: 1px solid #c9a84c33;
  padding: 0 2rem;
}

.nav-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.nav-brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #c9a84c;
  letter-spacing: 0.05em;
}

nav ul {
  list-style: none;
  display: flex;
  gap: 1.5rem;
}

nav a {
  color: #a89070;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.25rem 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

nav a:hover,
nav a.router-link-active {
  color: #c9a84c;
  border-bottom-color: #c9a84c;
}

main {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 2.5rem auto;
  padding: 0 1.5rem;
}
</style>
