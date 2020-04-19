<template>
  <footer class="page-footer">
    <div class="logo">
      <img src="../assets/footer.png" alt="footer">
      seidenader solutions
    </div>
    <div>&copy; Seidenader Maschinenbau GmbH. All rights reserved</div>
  </footer>
</template>
<script></script>
<style lang="scss" scoped>
  .page-footer {
    background: #111;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 40px;
    line-height: 40px;
    display: flex;
    color: #fff;
    justify-content: space-between;
    padding: 0 30px;

    .logo {
      height: 30px;
      text-transform: uppercase;
      img {
        flex: none;
        max-height: 100%;
        width: auto;
      }
    }
  }
</style>
