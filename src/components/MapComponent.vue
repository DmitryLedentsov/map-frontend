<template>
  <v-container fill-height>
    <v-dialog v-model="showCard" max-width="300">
      <v-card>

        <v-img
            v-if="currentMarker.image"
            :width="300"
            cover
            :src="currentMarker.image"
        >
        </v-img>

        <v-card-title>
          {{ currentMarker.title }}
        </v-card-title>

        <v-card-subtitle>
          {{ currentMarker.type.name }}
        </v-card-subtitle>

        <v-card-text>
          {{ currentMarker.description }}
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showForm" max-width="350" persistent>
      <v-card>
        <validation-observer ref="observer" v-slot="{ invalid }">
          <v-card-title>
            Создание объекта
          </v-card-title>

          <v-card-subtitle>
            Чтобы добавить объект на карту, заполните следующую форму
          </v-card-subtitle>

          <v-card-text>
            <validation-provider v-slot="{ errors }" name="Заголовок" rules="required">
              <v-text-field clearable
                            v-model="currentMarker.title"
                            :error-messages="errors"
                            label="Заголовок"
                            required>
              </v-text-field>
            </validation-provider>
          </v-card-text>

          <v-card-text>
            <validation-provider v-slot="{ errors }" name="Описание" rules="required">
              <v-textarea clearable
                          clear-icon="mdi-close-circle"
                          auto-grow
                          v-model="currentMarker.description"
                          :error-messages="errors"
                          label="Описание"
                          required>
              </v-textarea>
            </validation-provider>
          </v-card-text>

          <v-card-text>
            <validation-provider v-slot="{ errors }" name="ФИО" rules="required">
              <v-text-field clearable
                            v-model="currentMarker.creatorName"
                            :error-messages="errors"
                            label="ФИО"
                            required>
              </v-text-field>
            </validation-provider>
          </v-card-text>

          <v-card-text>
            <validation-provider v-slot="{ errors }" name="Email" rules="required|email">
              <v-text-field clearable
                            v-model="currentMarker.creatorContact"
                            :error-messages="errors"
                            label="Email"
                            required>
              </v-text-field>
            </validation-provider>
          </v-card-text>

          <v-card-text>
            <validation-provider v-slot="{ errors }" name="Изображение" rules="image|size:2000">
              <v-file-input
                  accept="image/png, image/jpeg"
                  placeholder="Выберите изображение"
                  prepend-icon="mdi-camera"
                  label="Изображение"
                  v-model="currentMarker.image"
                  :error-messages="errors"
              ></v-file-input>
            </validation-provider>
          </v-card-text>

          <v-card-actions>
            <v-btn
                :disabled="invalid"
                color="green darken-1"
                text
                @click="saveObject"
            >
              ОК
            </v-btn>
            <v-btn
                color="gray darken-1"
                text
                @click="cancelCreation"
            >
              Отмена
            </v-btn>
          </v-card-actions>
        </validation-observer>
      </v-card>
    </v-dialog>

    <v-progress-circular
        indeterminate
        color="primary"
        class="mx-auto"
        v-if="!showMap"
    ></v-progress-circular>

    <l-map
        style="z-index: 1;"
        v-if="showMap"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        @update:zoom="zoomUpdate"
        @click="mapClick"
    >
      <l-geosearch :options="geosearchOptions"/>
      <l-locatecontrol/>
      <l-control>
        <div style="max-height: 70vh; overflow-y: scroll;">
          <v-btn-toggle v-model="toggle_exclusive" mandatory class="flex-column">
            <v-tooltip left v-for="type in types" :key="type.tag">
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on">
                  <img height="20px" width="20px" :src="getIcon(type.tag)" alt="Тип объекта"/>
                </v-btn>
              </template>
              <span>{{ type.name }}</span>
            </v-tooltip>
          </v-btn-toggle>
        </div>
      </l-control>
      <l-tile-layer :url="url"/>
      <l-marker
          v-for="(marker, index) in markers"
          :visible="currentZoom > 11"
          :lat-lng="marker.coordinates"
          :key="index"
          :icon="createIcon(marker.type.tag, index)"
          @click="markerClick(index)">
      </l-marker>
    </l-map>
  </v-container>
</template>

<style>
@import "~leaflet/dist/leaflet.css";
@import "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css";
@import "https://unpkg.com/leaflet-geosearch@2.6.0/assets/css/leaflet.css";

.leaflet-control-attribution.leaflet-control {
  display: none;
}
</style>

<script>
import L, {latLng} from 'leaflet'
import {OpenStreetMapProvider} from "leaflet-geosearch"
import {email, image, required, size} from 'vee-validate/dist/rules'
import {extend, setInteractionMode, ValidationObserver, ValidationProvider} from 'vee-validate'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

setInteractionMode('eager')

extend('required', {
  ...required,
  message: '{_field_} не может быть пустым',
})

extend('email', {
  ...email,
  message: 'Некорректный Email',
})

extend('image', {
  ...image,
  message: 'Файл не является изображением',
})

extend('size', {
  ...size,
  message: 'Размер изображения не должен превышать 2МБ',
})

export default {
  components: {
    ValidationProvider,
    ValidationObserver,
  },

  name: 'MapComponent',

  data: () => ({
    zoom: 13,
    center: latLng(process.env.VUE_APP_START_LAT, process.env.VUE_APP_START_LNG),
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    // attribution: 'Grabli',
    withTooltip: latLng(process.env.VUE_APP_START_LAT, process.env.VUE_APP_START_LNG),
    currentZoom: 11.5,
    mapOptions: {
      zoomSnap: 0.5
    },
    toggle_exclusive: 0,

    types: [],
    markers: [],

    currentMarker: {
      id: null,
      type: {
        // id: null,
        name: ""
        // tag: ""
      },
      coordinates: null,
      title: "",
      description: "",
      creatorName: "",
      creatorContact: "",

      image: null
    },

    currentIndex: -1,

    showForm: false,
    showCard: false,
    showMap: false,

    geosearchOptions: {
      provider: new OpenStreetMapProvider()
    }
  }),
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.$http.get('street-objects/types').then(response => {
        if (response.status === 200) {
          this.types = [...response.data]
        }
      }).catch(error => {
        console.log(error.message)
      })

      this.$http.get('street-objects').then(response => {
        if (response.status === 200) {
          this.markers = [...response.data]
          this.showMap = true
        }
      }).catch(error => {
        console.log(error.message)
      })
    },

    mapClick(event) {
      // this.resetCurrentMarker()

      let type = this.types[this.toggle_exclusive]

      // this.currentMarker.type = type
      // this.currentMarker.coordinates = event.latlng
      // this.markers.push(this.currentMarker)
      let marker = {
        coordinates: [event.latlng.lat, event.latlng.lng],
        type: type,
      }

      this.markers.push(marker)
      this.currentMarker = marker

      this.showForm = true
    },

    saveObject() {
      this.closeForm()

      const info = {
        "typeId": this.currentMarker.type.id,
        "coordinates": this.currentMarker.coordinates,
        "title": this.currentMarker.title,
        "description": this.currentMarker.description,
        "creatorName": this.currentMarker.creatorName,
        "creatorContact": this.currentMarker.creatorContact,
      }

      const data = new FormData()
      data.append("info", this.convertToJsonFile(info))
      data.append("image", this.currentMarker.image)

      this.$http.post('street-objects', data).then(response => {
        const newMarker = this.markers.find(elem => !elem.id)
        newMarker.id = response.data.id
        newMarker.image = response.data.image
        console.log(response.data.id)
      }).catch(error => {
        console.log(error.message)
      })
    },

    convertToJsonFile(object) {
      return new Blob([JSON.stringify(object)], {
        type: 'application/json'
      })
    },

    cancelCreation() {
      this.closeForm()
      this.removeCurrentMarker()
    },

    closeForm() {
      this.$refs.observer.reset()
      this.showForm = false
    },

    removeCurrentMarker() {
      let markerIndex = this.markers.indexOf(this.currentMarker)
      if (markerIndex !== -1) {
        this.markers.splice(markerIndex, 1)
      }
    },

    zoomUpdate(zoom) {
      this.currentZoom = zoom
    },
    createIcon(tag, index) {
      let name;
      let iconSize;

      if (index === this.currentIndex) {
        name = tag + '_active'
        iconSize = [25, 32]
      } else {
        name = tag
        iconSize = [25, 25]
      }

      return L.icon({
        iconUrl: this.getIcon(name),
        iconSize: iconSize,
        iconAnchor: [12, 25]
      })
    },
    getIcon(icon) {
      return require(`../assets/icons/${icon}.png`)
    },
    centerUpdate(center) {
      console.log(center)
      // this.currentCenter = center
    },
    markerClick(index) {
      this.currentIndex = index
      this.currentMarker = this.markers[index]
      this.showCard = true
    }
  }
}
</script>
