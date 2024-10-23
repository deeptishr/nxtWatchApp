/* eslint-disable */

import '@testing-library/jest-dom'
import {configure} from '@testing-library/react'
import {configure as eCongfigure} from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'

eCongfigure({adapter: new Adapter()})
