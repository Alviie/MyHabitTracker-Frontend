<script setup lang="ts">

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')

const items = [
  {
    myActivity: "Joggen",
    time : "um 10:00 Uhr"
  },

  {
    myActivity: "Kochen",
    time : "um 11:30 Uhr"
  },

  {
    myActivity: "Lernen",
    time : "um 13:00 Uhr"
  }
]

</script>

<template>
  <table>
    <thead>
    <tr>
      <th>myActivity</th>
      <th>time</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="item in items" :key="item.id">
      <td>{{item.myActivity}}</td>
      <td>{{item.time}}</td>
    </tr>
    </tbody>
  </table>
</template>
