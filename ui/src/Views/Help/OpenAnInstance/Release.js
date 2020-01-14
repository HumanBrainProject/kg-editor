import React from "react";
import injectStyles from "react-jss";
import ReleaseStatus from "../../../Components/ReleaseStatus";

const styles = {
  container:{

  }
};

@injectStyles(styles)
class HelpView extends React.Component{
  render(){
    const {classes} = this.props;
    return (
      <div className={classes.container}>
        <h1>Release an instance</h1>
        <p>The “Release” view of an opened instance will show you the tree of instances linked to the opened instance with their status of release (meaning how they are accessible in the public API). The view is divided in two parts: on the left you can see the current state of the instances tree release status, and some toggles to select the action to perform on each instance, and on the right side you have a preview of the future state, once you will have pressed the proceed button.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Release/release.png`}/>
        </p>

        <h2>Selecting instances to release</h2>
        <p>By default, the preselected action is “release”, so that you can already click on the “Proceed” button if you want to release every instances linked to the opened instance.</p>
        <p>You can, for each instance, select what to do with the corresponding toggle. Possible actions are, “release” (if you wish to release the instance), “do nothing” (the instance will remain in the same state), “unrelease” (the instance won’t be accessible in the public API anymore).</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Release/toggles.png`}/>
        </p>

        <p>You can perform actions on a whole subset of the tree by clicking on a node, and selecting a batch action that will be applied on each instance of that subtree.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Release/subtree.png`}/>
        </p>

        <p>Warning : Be careful, if you unreleased an instance, it will be also unreleased for all other instances linking that specific instance. If your goal is to remove a link to an instance, you should use the edit mode to remove that link.</p>
        <p>If you want to see which instances are linked to an instance, you can open that instance in a new tab and use the “Explore” view. If you want to learn more about the “Explore” view, please read the corresponding help section.</p>

        <h2>About the release status indicator</h2>
        <p>The release status indicator will show you in a glance the status of an instance and its linked instances. Here are the rules to understand this indicator :</p>

        <ul>
          <li>If the indicator has only one icon, it means the instance doesn’t have any linked instance and the icon indicates the release status of this instance</li>
          <li>If the indicator has two icons, the first one indicates the release status of this instance and the second indicates the worst release status of the underlying linked instances (released, has changed, not released)</li>
        </ul>

        <ul>
          <li>This icon (check) means the instance is released, i.e. the version you can see in the editor is the same accessible in the public API.</li>
          <li>This icon (changes) means the instance exists in the public API, but it’s different, and probably in an older version than the one you can see in the editor.</li>
          <li>This icon (no released) means the instance doesn’t exist at all in the public API.</li>
        </ul>

        <p>Finally the color of the indicator is meant to draw or not your attention on instances requiring actions to be visible in the public API.</p>

        <ul>
          <li>The blue color means that this instance and all of its underlying children is released.</li>
          <li>The yellow color means that this instance or at least one of its children is different (and probably has had recent changes) than the one in the public API.</li>
          <li>The red color means that this instance or at least one of its children doesn’t exist in the public API.</li>
        </ul>

        <h3>Examples</h3>
        <p>Hover those examples with your mouse to reveal a tooltip explaining the status</p>
        <p><ReleaseStatus darkmode={true} instanceStatus="RELEASED" childrenStatus="RELEASED"/></p>
        <p><ReleaseStatus darkmode={true} instanceStatus="RELEASED" childrenStatus="HAS_CHANGED"/></p>
        <p><ReleaseStatus darkmode={true} instanceStatus="RELEASED" childrenStatus="UNRELEASED"/></p>

        <p><ReleaseStatus darkmode={true} instanceStatus="HAS_CHANGED" childrenStatus="RELEASED"/></p>
        <p><ReleaseStatus darkmode={true} instanceStatus="HAS_CHANGED" childrenStatus="HAS_CHANGED"/></p>
        <p><ReleaseStatus darkmode={true} instanceStatus="HAS_CHANGED" childrenStatus="UNRELEASED"/></p>

        <p><ReleaseStatus darkmode={true} instanceStatus="UNRELEASED" childrenStatus="RELEASED"/></p>
        <p><ReleaseStatus darkmode={true} instanceStatus="UNRELEASED" childrenStatus="HAS_CHANGED"/></p>
        <p><ReleaseStatus darkmode={true} instanceStatus="UNRELEASED" childrenStatus="UNRELEASED"/></p>

        <p><ReleaseStatus darkmode={true} instanceStatus="RELEASED" childrenStatus={null}/></p>
        <p><ReleaseStatus darkmode={true} instanceStatus="HAS_CHANGED" childrenStatus={null}/></p>
        <p><ReleaseStatus darkmode={true} instanceStatus="UNRELEASED" childrenStatus={null}/></p>
      </div>
    );
  }
}

export default HelpView;