import React from 'react'
import flickrService from './flickrService'
import googleMapsService from './googleMapsService'

class Display extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            photos: [],
            currentNumber: 0,
            lat: 25.034281,
            lon: -77.396278,
            city: 'Nassau, The Bahamas',
            searchTerm: 'dog',
            photoCount: 5,
            formData: {
                searchTerm: '',
                city: '',
                photoCount: 1
            }
        }
    }

    // this lifecycle method runs after the components first render
    componentDidMount() {
        this.getLocation()
    }

    // get the location from the user
    getLocation() {
        let onSuccess = (location) => {
            this.setState({
                lat: location.coords.latitude,
                lon: location.coords.longitude
            }, this.getPictures)
        }
        let onFail = (err) => {
            console.warn(err.message)
            this.getPictures()
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onFail)
    }

    // get pictures from the flickr api
    getPictures() {
        flickrService(this.state).then((responsePhotoObject) => {
            this.setState({ photos: responsePhotoObject.photos.photo })
        })
    }

    reverseGeocodeCity() {
        googleMapsService(this.state).then((loc) => {
            console.log(loc.results[0].geometry.location)
            this.setState({
                lat: loc.results[0].geometry.location.lat,
                lon: loc.results[0].geometry.location.lng,
            }, this.getPictures)
        })
    }

    // construct an image URL from the photoObj we got from flickr
    constructImageURL(photoObj) {
        return "https://farm" + photoObj.farm +
            ".staticflickr.com/" + photoObj.server +
            "/" + photoObj.id + "_" + photoObj.secret + ".jpg";
    }

    // handle incrementing this.state.currentNumber so we can cycle through the photo array
    handleNext = () => {
        this.setState((prevState) => {
            const atEndOfArray = prevState.currentNumber === prevState.photos.length - 1
            if (atEndOfArray) {
                return { currentNumber: 0 }
            } else {
                return { currentNumber: prevState.currentNumber + 1 }
            }
        })
    }

    // handle when the user submits the form data
    handleSubmit = (event) => {
        event.preventDefault();

        this.setState((prevState) => {
            return {
                city: prevState.formData.city || prevState.city,
                searchTerm: prevState.formData.searchTerm || prevState.searchTerm,
                photoCount: prevState.formData.photoCount,
                currentNumber: 0
            }
        }, this.reverseGeocodeCity);
    }

    // handle when the user changes the data in the input fields on the form
    handleChange = (event) => {
        const newformData = { ...this.state.formData };
        newformData[event.target.name] = event.target.value;

        this.setState({ formData: newformData });
    }

    render() {
        if (this.state.photos.length === 0) {
            return <div>Loading...</div>
        } else {
            const currentPhotoObj = this.state.photos[this.state.currentNumber]
            const photoURL = this.constructImageURL(currentPhotoObj)
            return (
                <div className="Display">
                    <button onClick={this.handleNext}>Next Photo</button>
                    <br />
                    <img src={photoURL} alt="flickr img" />
                    <h3>{currentPhotoObj.title}</h3>
                    <form onSubmit={this.handleSubmit}>
                        <fieldset>
                            <legend>Get Different Photos</legend>
                            <div>
                                <label htmlFor="searchTerm">Search Term: </label>
                                <br />
                                <input
                                    type="text"
                                    name="searchTerm"
                                    value={this.state.formData.searchTerm}
                                    onChange={this.handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="city">City (e.g. Atlanta, GA or London, England): </label>
                                <br />
                                <input
                                    type="text"
                                    name="city"
                                    value={this.state.formData.city}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="city">Photo Count: </label>
                                <br />
                                <input
                                    type="number"
                                    name="photoCount"
                                    value={this.state.formData.photoCount}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <h4>(Leave field empty to use previous search parameters)</h4>
                            <div>
                                <h3>Previous Search:</h3>
                                Search Term: {this.state.searchTerm}, City: {this.state.city}, Photo Count: {this.state.photoCount}
                            </div>
                        </fieldset>
                        <button>Submit</button>
                    </form>
                </div>
            )
        }
    }
}

export default Display;