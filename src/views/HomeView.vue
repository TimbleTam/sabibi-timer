<script setup lang="ts">
function launchTimer() {
  const width = 430;
  const height = 430;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;

  window.open(
    "/sabibi-timer/#/timer",
    "sabibi-timer",
    `width=${width},height=${height},left=${left},top=${top},resizable=no,menubar=no,toolbar=no,location=no,status=no`,
  );
}
</script>

<template>
  <div class="home">
    <button class="launch-btn" @click="launchTimer">Start Timer</button>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.launch-btn {
  padding: 1rem 2.5rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #6d28d9;
  }
}
</style>
