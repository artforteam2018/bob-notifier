<template>
  <v-app>
      <HelloWorld/>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  }),
};
</script>

<style lang="scss">

  .v-application {
    background: #000000 !important;
  }

  .v-data-table,.v-dialog{
    background: #000000 !important;
    border: solid #11ddf0 1px;
    color: rgba(17,221,240,1) !important;

    tr:hover {
      background: #000000 !important;
    }
    thead, th {
      color: rgba(17,221,240,1) !important;
      border-right: solid #11ddf0 1px !important;
      border-bottom: solid #11ddf0 1px !important;
    }

  }




  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #e9e9e9;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
