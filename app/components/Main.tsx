import Features from "./MainComponents/Features"
import Initialtxt from "./MainComponents/Initialtxt"
const Main = () => {
  return (
    <div className="min-h-screen  ">
      <section id="/">
        <Initialtxt />
      </section>
      <section id="features">
        <Features />
      </section>
    </div>
  )
}

export default Main