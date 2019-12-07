<template>
  <div class="mx-5 my-5">
    <div class="d-flex align-center justify-space-between mb-3">
      <v-btn outlined @click="add = !add" color="primary">Добавить монету</v-btn>
      <v-icon class="mx-2" :color="connection ? 'green' : 'red'">wifi_tethering</v-icon>
    </div>
    <v-card>

      <v-data-table
        :headers="headers"
        :items="items"
      >
        <template v-slot:item="{ item }">
          <tr :class="getColor(item)">
            <td>{{ item.symbol }}</td>
            <td>{{ item.price_wait }}</td>
            <td>{{ item.price_now }}</td>
            <td style="border-right: 0 !important;">
              <v-icon @click="remove(item)" :class="getColor(item)">delete</v-icon>
            </td>
          </tr>
        </template>


      </v-data-table>
      <v-dialog
        v-model="add"
        width="500"
      >
        <div class="text-center headline">Новая монета</div>
        <div class="d-flex align-center justify-space-between">
          <v-select class="col-6"
                    label="Тикет"
                    :items="symbols"
                    v-model="new_item.symbol">

          </v-select>
          <v-text-field
            class="col-6"
            v-model="new_item.price_wait"
            label="Ожидаемая цена"
          ></v-text-field>
        </div>
        <div class="d-flex justify-end">
          <v-btn class="col-3 mb-2 mr-3" outlined @click="addItem" color="primary">Добавить</v-btn>
        </div>
      </v-dialog>
    </v-card>
  </div>
</template>

<script>
	import io from 'socket.io-client';
	import * as hd from 'humanize-duration';

	export default {
		name: 'HelloWorld',
		created() {

			let audioUp = new Audio(require('../sound.mp3'));
			let audioDown = new Audio(require('../sound2.mp3'));

			this.io = io('http://127.0.0.1/');

			this.io.on('connect', () => this.connection = true);
			this.io.on('disconnect', () => this.connection = false);

			this.axios = require('axios');
			this.axios.get('http://localhost/binance/symbols').then(res => {
				if (Array.isArray(res.data)) this.symbols = res.data.sort((a, b) => a > b ? 1 : -1);
			});

			this.axios.get('http://localhost/notifier/items').then(res => {
				if (Array.isArray(res.data)) this.items = res.data;
			});


			this.io.on('binance_trade', data => {
				let items = this.items.filter(a => a.symbol === data.symbol);
				items.map(item => {
					if (!item.price_now) {
						if (item.price_wait <= data.price) {
							console.log('down');
							this.$set(item, 'arrow', 'down');
							this.updateItems();
						}
						if (item.price_wait > data.price) {
							console.log('up');
							this.$set(item, 'arrow', 'up');
							this.updateItems();
						}
					}
					this.$set(item, 'price_now', data.price);
					if (data.price < item.price_wait && item.arrow === 'down') {
						audioDown.play();
						this.$set(item, 'bomb', true)
						this.updateItems();
					}
					if (data.price >= item.price_wait && item.arrow === 'up') {
						audioUp.play();
						this.$set(item, 'bomb', true)
						this.updateItems();
					}
				});
			});
		},
		data: () => ({
			new_item: {
				symbol: '',
				price_wait: '',
			},
			add: false,
			logs: [],
			connection: false,
			headers: [
				{text: 'Валюта', value: 'symbol'},
				{text: 'Ожидаемая цена', value: 'price_wait'},
				{text: 'Текущая цена', value: 'price_now'},
				{text: 'Удалить', value: 'delete'}
			],
			symbols: [],
			items: []
		}),
		methods: {
			updateItems() {
				this.axios.post('http://localhost/notifier/items', this.items)
			},
			addItem() {
				this.items.push(this.new_item);
				this.new_item = {
					symbol: '',
					price_wait: '',
				};
				this.add = !this.add;
				this.updateItems();
			},
			remove(item) {
				this.items.splice(this.items.findIndex(a => a == item), 1);
				this.updateItems();
			},
			getColor(item) {
				if (item.arrow === 'down' && item.bomb) return 'red-lines';
				if (item.arrow === 'up' && item.bomb) return 'green-lines';
				return 'def-lines';
			}
		},
		computed: {},
		filters: {
			dirBackground: (dir) => {
				return dir === 'B' ? 'background: #B2FFB2' : 'background: #FFB2B2';
			},
		}
	};
</script>

<style lang="scss">
  .signal-style {
    width: 200px;
  }

  .v-select__slot, .v-text-field__slot {
    border-bottom: solid 1px;

  }

  .v-select__selections, label, input {
    color: #00acc1 !important;
  }

  .def-lines {
    td {
      color: rgba(17, 221, 240, 1) !important;
      border-right: solid #11ddf0 1px !important;
      border-bottom: solid #11ddf0 1px !important;
    }

    i {
      color: rgba(17, 221, 240, 1) !important;
    }
  }

  .red-lines {
    td {
      color: rgb(183, 10, 28) !important;
      border-right: solid #B70A1C 1px !important;
      border-bottom: solid #B70A1C 1px !important;
    }

    i {
      color: rgb(183, 10, 28) !important;
    }
  }

  .green-lines {
    td {
      color: rgb(15, 183, 35) !important;
      border-right: solid #0fb723 1px !important;
      border-bottom: solid #0fb723 1px !important;
    }

    i {
      color: rgb(15, 183, 35) !important;
    }
  }


</style>
