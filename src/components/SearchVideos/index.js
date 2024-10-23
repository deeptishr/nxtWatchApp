import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {AiOutlineSearch} from 'react-icons/ai'

import VideoCard from '../VideoItems'

import CartContext from '../../context/CartContext'

import {
  SearchVideoContainer,
  SearchInput,
  VideoContainer,
  ProductsLoaderContainer,
  NotFoundContainer,
  Image,
  Heading,
  Desc,
  Navlink,
  Retry,
} from './styledComponents'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class SearchVideos extends Component {
  state = {
    serachInput: '',
    searchValue: '',
    apiStatus: apiStatusConstants.initial,
    searchedVideos: [],
  }

  componentDidMount() {
    this.getSuggestionVideos()
  }

  onChangeSearchInput = event => {
    this.setState({serachInput: event.target.value})
  }

  onClickSearchButton = () => {
    const {serachInput} = this.state
    this.setState({searchValue: serachInput}, this.getSuggestionVideos)
  }

  onEnterClickSearch = event => {
    if (event.key === 'Enter') {
      const {serachInput} = this.state
      this.setState({searchValue: serachInput}, this.getSuggestionVideos)
    }
  }

  getSuggestionVideos = async () => {
    const {searchValue} = this.state
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/videos/all?search=${searchValue}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const fetchedData = await response.json()
      const updatedData = fetchedData.videos.map(each => ({
        id: each.id,
        channel: {
          name: each.channel.name,
          profileImageUrl: each.channel.profile_image_url,
        },
        publishedAt: each.published_at,
        thumbnailUrl: each.thumbnail_url,
        viewCount: each.view_count,
        title: each.title,
      }))
      this.setState({
        searchedVideos: updatedData,
        apiStatus: apiStatusConstants.success,
      })
    }
    if (response.ok !== true) {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderLoadingView = () => (
    <ProductsLoaderContainer
      className="products-loader-container"
      data-testid="loader"
    >
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </ProductsLoaderContainer>
  )

  renderHomeVideos = () => (
    <CartContext.Consumer>
      {value => {
        const {isDarkTheme} = value
        const {serachInput, searchedVideos} = this.state
        console.log(serachInput)

        const bgColor = isDarkTheme ? '#231f20' : '#f9f9f9'
        const isVideosAvailable = searchedVideos.length === 0

        return isVideosAvailable ? (
          <div>
            <Image
              src="https://assets.ccbp.in/frontend/react-js/nxt-watch-no-search-results-img.png"
              className="no-products-img"
              alt="no videos"
            />
            <Heading className="no-product-heading">
              No Search result found
            </Heading>
            <Desc className="no-product-description">
              Try different key words or remove search filter
            </Desc>
            <Retry onClick={this.getSuggestionVideos}>Retry</Retry>
          </div>
        ) : (
          <SearchVideoContainer bgColor={bgColor}>
            <div>
              <SearchInput
                type="search"
                placeholder="Search"
                value={serachInput}
                onChange={this.onChangeSearchInput}
                onKeyDown={this.onEnterClickSearch}
              />
              <button
                type="button"
                data-testid="searchButton"
                onClick={this.onClickSearchButton}
              >
                <AiOutlineSearch />
              </button>
            </div>
            <VideoContainer>
              {searchedVideos.map(each => (
                <VideoCard key={each.id} details={each} />
              ))}
            </VideoContainer>
          </SearchVideoContainer>
        )
      }}
    </CartContext.Consumer>
  )

  renderFailureView = () => (
    <NotFoundContainer>
      <Image
        src="https://assets.ccbp.in/frontend/react-js/nxt-watch-failure-view-light-theme-img.png"
        alt="failure view"
        className="jobs-failure-img"
      />
      <Heading>Oops! Something Went Wrong</Heading>
      <Desc className="jobs-failure-description">
        We are having some trouble to complete your requset.Please try again.
      </Desc>
      <Navlink>
        <Retry onClick={this.getSuggestionVideos}>Retry</Retry>
      </Navlink>
    </NotFoundContainer>
  )

  renderAllVideos = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderHomeVideos()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    return <>{this.renderAllVideos()}</>
  }
}

export default SearchVideos
