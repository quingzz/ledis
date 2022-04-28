<template lang="">
  <div class="px-20 pt-5 max-h-screen">
    <div class="font-mono text-2xl pl-20 py-5">Welcome to Lepis</div>
    <div class="flex flex-grow justify-center">
      <div class="flex flex-col w-3/4 bg-slate-300 text-black">
        <div class="flex flex-col px-10 pt-5">
          <div
            id="scrollable"
            class="flex flex-col max-h-96 bg-slate-300 overflow-y-scroll"
          >
            <div v-for="line in this.history" :key="line.id">
              {{ line }}
            </div>
          </div>

          <!-- Div for enter line-->
          <div class="py-2">
            >>
            <input
              type="text"
              v-on:keyup.enter="onEnter()"
              class="w-5/6 bg-slate-300 focus:border-b focus:border-gray-400 focus:outline-none"
              placeholder="Enter your command here"
              v-model="inputText"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { HandleInput } from "../handleInput";
let inputHandler = new HandleInput();

let timer = setInterval(() => {
  inputHandler.counter_dec();
}, 1000);

export default {
  data() {
    return {
      history: [],
      inputText: "",
    };
  },
  methods: {
    onEnter() {
      if (this.inputText.trim().length > 0) {
        // add old input and output to history array
        this.history.push(">>  " + this.inputText);

        try {
          let output = inputHandler.inputProcessing(this.inputText);
          this.history.push(output);
        } catch (err) {
          this.history.push("ERROR: " + err);
        }

        // delete old input
        this.inputText = "";

        var scrollable = this.$el.querySelector("#scrollable");
        scrollable.scrollTop = scrollable.scrollHeight;
      }
    },
  },
};

// countdown();
// stop reducing counter when window is closed
window.onbeforeunload = () => {
  clearInterval(timer);
};
</script>
<style lang=""></style>
