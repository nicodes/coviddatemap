import './header.scss'

const Drawer = ({ drawerOpen, setDrawerOpen }) =>
  <header>
    <button onClick={() => setDrawerOpen(!drawerOpen)}>
      {drawerOpen ? '<' : '>'}
    </button>
  </header>

export default Drawer
