<template>
  <div>
    <div>
      <div>
        <p class="Zwischenüberschrift" style="text-align: center;">Welcome to the Online Help for</p>
        <p class="Zwischenüberschrift" style="text-align: center;">
          <img class="img-title" src="../assets/logo-ejectx_338x141.png" style="width: 338px;height: 141px;"/>
        </p>
        <p class="title" style="text-align: center;font-size: 18pt;">Version <span
          class="GeneralSVO version">{{ version }}</span></p>
        <h1>Table of Contents</h1>
        <p><a href="#Getting-started">Getting started</a></p>
        <p><a href="#Work_Spaces">Work Spaces</a></p>
        <p><a href="#Step_1:_Classify">Step 1: Classify</a></p>
        <p><a href="#Step_2:_Train">Step 2: Train</a></p>
        <p><a href="#Step_3:_Test">Step 3: Test</a></p>
        <p><a href="#Step_4:_Validate">Step 4: Validate</a></p>
        <p>&#160;</p>
        <h1><a name="Getting-started"></a>Getting started</h1>
        <p style="text-decoration: underline;">Starting from the Desktop</p>
        <div>
          <p>→ Double-click on svtrain.bat located on the Desktop. A command line window appears.</p>
          <p>→ Double-click on the EjectX file on the Desktop. A Chrome window appears.</p>
          <p>→ Enter a username and the corresponding password.</p>
          <p>→ Click on the Login button.</p>
        </div>
        <div>
          <p style="text-decoration: underline;">Starting in the Cloud</p>
          <p>→ Open the website <a href="https://www.ejectx.de">https://www.ejectx.de</a>.</p>
          <p>→ Enter a username and the corresponding password.</p>
          <p>→ Click on the Login button.</p>
          <p>It is possbile to use different users and roles. The user rights are configured by Seidenader.</p>
        </div>
        <h1><a name="Work_Spaces"></a>Work Spaces</h1>
        <div>
          <p>The Work Spaces screen is the start screen. It offers an overview over your different work spaces and
            interaction possibilities.</p>
          <p style="font-weight: bold">What is a work space</p>
        </div>
        <p>A work space refers to the images that one SVObserver camera station took from one object with the same
          machine
          recipe (settings for light, rotation, etc.). It contains several subfolders. Depending on the input images and
          their structure, the subfolders represent the defect classes or are unstructured. The input images and their
          structure are the result from the SVObserver configuration.</p>
        <p>You can train an AI model for each work space. After the model is validated, it is possible to integrate it
          in
          SVObserver.</p>
        <p>&#160;</p>
        <p style="font-weight: bold">Content of the work spaces screen</p>
        <p>For each work space and the subfolders, you can see details about the folder's content (total number of
          files,
          percentage), show a confusion matrix, add notes and configure settings.</p>
        <p>The percentage of the work space indicates the rate of classified images in proportion to all images in the
          work space (subfolders included).</p>
        <div>
          <p style="text-decoration: underline;">Add new work space</p>
          <div>
            <p>You can add a new work space at the top level or as subfolder in an existing work space.</p>
            <p>→ Navigate to the location where you want to add a new work space.</p>
            <p>→ Click on the New Work Space button.</p>
            <p>→ Enter a name and click on Create. The work space should have the same name as the folder containing the
              images.</p>
            <p>→ The new work space is immediately visible.</p>
          </div>
        </div>
        <p style="text-decoration: underline;">Configure work space</p>
        <div>
          <p>You can change the configuration of a work space. The configuration is always done on the main work space
            and
            applies to the subfolders.</p>
          <p>→ Click on the gear symbol of the work space you want to configure. A window pops up.</p>
          <p>→ Change in the JSON structure the values of the parameter you want to configure.</p>
          <p>→ Click on Save and refresh the page to apply your new configuration.</p>

          <p>You can change the following parameters:</p>
          <table style="width: 100%;">
            <col style="width: 20px;"/>
            <col style="width: 232px;"/>
            <tbody>
            <tr>
              <td style="font-weight: bold;background-color: #a9a9a9;">Parameter</td>
              <td style="font-weight: bold;background-color: #a9a9a9;"><p>Work space configuration</p></td>
            </tr>
            <tr>
              <td>filePerPage</td>
              <td><p>Set a number of images that you want to see in one screen. When using the <a
                href="#Confirm_Method">"Confirm"
                method</a>, make sure to set the same number as you have images from one object. In this case, the
                advantage is that you see all images of one specifc object at one screen.</p></td>
            </tr>
            <tr>
              <td>showFileName</td>
              <td><p>Set the value to true if you want to display the file name below the image. The file name will be
                highlighted in red when the image was not identified by the AI model. The file name will be highlighted
                in
                green if it is identified correctly.</p></td>
            </tr>
            <tr>
              <td>useShortcuts</td>
              <td><p>Set true if you want to use keyboard shortcuts. Otherwise, set false. See below for an overview of
                the shortcuts.</p></td>
            </tr>
            <tr>
              <td>requestBeforeDelete</td>
              <td><p>Set true if you want to display a confirmation prompt before moving a file in the Deleted
                folder.</p>
              </td>
            </tr>
            <tr>
              <td>defaultPictureSize</td>
              <td><p>Set a default for the picture size in pixels. Pictures are shown in square format.</p></td>
            </tr>
            <tr>
              <td>deleteDefaultFolder</td>
              <td><p>This is the path for the folder where deleted images are put. You can enter absoulute path names or
                relative path names that refer to the work space. Path names have to match with the path structure in
                Explorer.
              </p></td>
            </tr>
            <tr>
              <td>selectedPath</td>
              <td><p>This is the path for the folder where images are put after you selected and confirmed them to have
                a
                defect. This parameter is used in the <a href="#Confirm_Method">"Confirm" method</a>.</p></td>
            </tr>
            <tr>
              <td>notSelectedPath</td>
              <td><p>This is the path for the folder where images without defects are put after you selected and
                confirmed
                the images with defects. This parameter is used in the <a href="#Confirm_Method">"Confirm" method</a>.
              </p>
              </td>
            </tr>
            <tr>
              <td>forwardOnly</td>
              <td><p>Set true as value if you want to use the <a href="#Confirm_Method">"Confirm" method</a>. Set false
                if
                you want to use the <a href="#Select_Method">"Select" method</a>.</p></td>
            </tr>
            <tr>
              <td>buttonFontSize</td>
              <td><p>Set a value for the font size applied to the button.</p></td>
            </tr>
            <tr>
              <td>titleFontSize</td>
              <td><p>Set a value for the font size applied to the title.</p></td>
            </tr>
            <tr>
              <td>defaultEpoch</td>
              <td><p>A default setting for the training mechanism.</p></td>
            </tr>
            <tr>
              <td>defaultLearningRate</td>
              <td><p>A default setting for the training mechanism.</p></td>
            </tr>
            <tr>
              <td>forwardLocation</td>
              <td><p>Set a value for the location of the forward button. You can set right or top.</p></td>
            <tr>
              <td>moveMenu</td>
              <td><p>Set true as value if you want to display a menu on the right that allows you to select defect
                classes. Set false if you don't want to display such a menu.<br><b>Note: </b>This parameter should be
                set
                to false if you use the <a href="#Confirm_Method">"Confirm" method</a>. Otherwise, it is possible to
                move
                single images. This would lead to the fact that you do not see the image set for one specific object in
                one screen.</p></td>
            </tr>
            <tr>
              <td>newFolder</td>
              <td><p>Set this parameter to true if you want to display a button that allows to create a new folder
                within
                a work space.</p></td>
            </tr>
            <tr>
              <td>newWorkspace</td>
              <td><p>Set true as value if you want to display a button that allows to create a new work space.</p></td>
            </tr>
            <tr>
              <td>imageSpacing</td>
              <td><p>Enter a number to define the distance between the images.</p></td>
            </tr>
            <tr>
              <td>workspaceFontSize</td>
              <td><p>Set a value for the font size applied to the name of the work space in the work spaces
                overview.</p>
              </td>
            </tr>
            <tr>
              <td>subFolderFontSize</td>
              <td><p>Set a value for the font size applied to the name of the subfolders in the work spaces
                overview.</p>
              </td>
            </tr>
            <tr>
              <td>imageFit</td>
              <td><p>Set fill as value if you want to display the images in the size set as defaultPictureSize.<br>Set
                fit
                you want to display the images in their full size.</p></td>
            </tr>
            <tr>
              <td>imageViewer</td>
              <td><p>Set true as value if you want to display an additional button that allows you to view selected
                images
                in a special viewer.</p></td>
            </tr>
            </tbody>
          </table>
        </div>
        <p style="text-decoration: underline;">Show subfolders of work spaces</p>
        <div>
          <p>→ Click on the triangle button to expand the list of subfolders.</p>
          <p>→ All subfolders and the corresponding details appear.</p>
        </div>
        <div>
          <p style="text-decoration: underline;">Show confusion matrix</p>
          <div>
            <p>→ Click on the statistic button to show a confusion matrix.</p>
            <p>→ The matrix shows a comparison between the classification made by the system (AI classification) and the
              classification made by the user (user classification).</p>
            <p>→ As long as you have not yet tested your model, AI classification shows all images as unclassified.</p>
            <p>Here is an example of how a confusion matrix may look like:</p>
            <p>
              <img src="../assets/confusion-matrix_770x479.png" style="width: 770px;height: 479px;"/>
            </p>
            <p>→ Switch between "Autofit" and "Scroll" to change the width of the columns if you a large number of
              classes.</p>
            <p>→ Switch between "Absolute Numbers" and "Percentage" to change the visualization of the numbers.</p>
          </div>
        </div>
        <div>
          <p style="text-decoration: underline;">Add notes</p>
          <div>
            <p>→ Click on the notepad button to open the notes dialog.</p>
            <p>→ You can change the color of the notepad button as signal that there is a note. To do so, click on
              Highlight
              Note.</p>
            <p>→ Save the note by clicking on the Save button.</p>
            <p>→ If you highlighted the note, the notepad button is blue.</p>
          </div>
        </div>
        <p>&#160;</p>
        <h1><a name="Step_1:_Classify"></a>Step 1: Classify</h1>
        <p>Depending on the configuration, there are two different ways to classify images.</p>
        <p><a name="Select_Method"></a><b>Classification by assigning images to a class - "Select Method"</b></p>
        <p>This method is used when the input images are not structured and have not been preselected according to
          defect
          classes. The unclassified images are in one subfolder and subfolders for each defect class exist in the work
          space
          overview.</p>
        <p>To classify images of a work space, click on the name of the work space.</p>
        <p>→ Open the folder Unclassified.</p>
        <p>→ Select one or several images that you want to assign to the same class. If the parameter for using
          shortcuts
          is
          active, you can also enter 1 to select the first image, 2 for the second etc. and 0 for the 10th image.</p>
        <p>→ The available classes are shown on the right side when you select a file.</p>
        <p>→ Click on the corresponding class.</p>
        <p>→ The selected image(s) are moved to the corresponding folder.</p>
        <p>→ The page refreshes automatically so that it displays only the unclassified images.</p>

        <p><a name="Confirm_Method"></a><b>Classification by confirming defects on images - "Confirm Metod"</b></p>
        <p>This method is used when the input images are structured and have been preselected according to defect
          classes.
          This means each folder contains images of the same defect class. You select images and confirm them if a
          defect
          is
          present.</p>
        <p>To classify images of a work space, click on the name of the work space.</p>
        <p>→ Open a folder that you want to classify the images of.</p>
        <p>→ Select one or several images that contain a defect. If the parameter for using shortcuts is active, you can
          also enter 1 to select the first image, 2 for the second etc. and 0 for the 10th image.</p>
        <p>→ Click on the Confirm button on the right.</p>
        <p>→ The selected image(s) are moved to the corresponding folder. Image that you did not selected are moved to
          another folder.</p>
        <p>→ The page refreshes automatically so that it displays the next set of images.</p>
        <p>&#160;</p>
        <p style="font-weight: bold;">Further interaction and customizing possibilities:</p>
        <div><p style="text-decoration: underline;">Double-click on an image</p>
          <div>
            <p>→ Double-click on an image to display it in a pop-up window.</p>
            <p>→ A bar is displayed above the image.</p>
            <p>→ Slide the button to the right to increase the size of the image.</p>
            <p>→ Slide the button to the left to decrease the size of the image.</p>
          </div>
        </div>
        <div><p style="text-decoration: underline;">Zoom in and out</p>
          <div>
            <p>→ If you want to increase the size of the images, click on the magnifier symbol with a plus in it.</p>
            <p>→ If you want to decrease the size of the images, click on the magnifier symbol with a minus in it.</p>
          </div>
        </div>
        <div>
          <p style="text-decoration: underline;">Show keyboard shortcuts (information button)
          <p>
            <div>
          <p>→ Click on the information button to show a list of available shortcuts.</p>
          <p>The following shortcuts are available:</p>
          <table style="width: 100%;">
            <col style="width: 231px;"/>
            <col style="width: 232px;"/>
            <tbody>
            <tr>
              <td style="font-weight: bold;background-color: #a9a9a9;"><p>Function</p></td>
              <td style="font-weight: bold;background-color: #a9a9a9;">Shortcut</td>
            </tr>
            <tr>
              <td><p>Zoom in</p></td>
              <td>Plus key +</td>
            </tr>
            <tr>
              <td><p>Zoom out</p></td>
              <td>Minus key -</td>
            </tr>
            <tr>
              <td><p>Select/Unselect image</p></td>
              <td>Space bar</td>
            </tr>
            <tr>
              <td><p>Select multiple images</p></td>
              <td>Shift key + Space bar</td>
            </tr>
            <tr>
              <td><p>Move left</p></td>
              <td>Leftwards arrow key</td>
            </tr>
            <tr>
              <td><p>Move right</p></td>
              <td>Rightwards arrow key</td>
            </tr>
            <tr>
              <td><p>Move up</p></td>
              <td>Upwards arrow key</td>
            </tr>
            <tr>
              <td><p>Move down</p></td>
              <td>Downwards arrow key</td>
            </tr>
            <tr>
              <td><p>Previous page</p></td>
              <td>Page up key</td>
            </tr>
            <tr>
              <td><p>Next page/Confirm defect on image (only available when "Confirm Method" is active)</p></td>
              <td>Page down key</td>
            </tr>
            <tr>
              <td><p>Select folder by name</p></td>
              <td>Enter the first letter of the folder</td>
            </tr>
            <tr>
              <td><p>Numbers</p></td>
              <td>Enter 1 to select the first image, 2 for the second etc. and 0 for the 10th image (parameter must be
                correctly configured)
              </td>
            </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div>
      <p style="text-decoration: underline;">Delete image(s)</p>
      <div>
        <p>→ If you want to delete one or several images, select the image(s) you want to delete.</p>
        <p>→ Click on the button Delete image(s). If the parameter for using shortcuts is active, you can also enter 1
          to
          select the first image, 2 for the second etc. and 0 for the 10th image.</p>
      </div>
    </div>
    <div>
      <p style="text-decoration: underline;">Backward/Forward</p>
      <div>
        <p>→ Use these buttons to navigate to the previous or next page.</p>
      </div>
    </div>
    <p>&#160;</p>
    <h1><a name="Step_2:_Train"></a>Step 2: Train</h1>
    <div>
      <p>When you finished classifying the images, you can start the training of the AI model.</p>
      <p>→ Click on the Train button in the top bar.</p>
      <p>→ Make sure that the correct work space is indicated.</p>
      <p>→ Click on the button Run train batch.</p>
      <p>The training can take an extended period of time based on the number of images you classified. The more images
        you classified, the longer the training takes. The status of the training is displayed above the button Run
        train
        batch.</p>
      <p style="text-decoration: underline;">Stop running train</p>
      <p>You can stop the training by clicking on the respective button. The training of the model is cancelled. If you
        restart the training, the previous model is overwritten.</p>
      <p>&#160;</p>
      <h1><a name="Step_3:_Test"></a>Step 3: Test</h1>
      <p>When you finished training the model, you can start testing the AI model.</p>
      <p>→ Click on the Test button in the top bar.</p>
      <p>→ Make sure that the correct work space is indicated.</p>
      <p>→ Click on the button Run test batch.</p>
      <p>The testing can take an extended period of time based on the number of images you classified. The more images
        you
        classified, the longer the test takes. The status of the test is displayed above the button Run test batch.</p>
      <p>→ Review the results by opening the confusion matrix.</p>
      <p>→ Decide if the AI model can be validated. If yes, go to the next step. Otherwise, go back to the image
        classification.</p>
      <p style="text-decoration: underline;">Stop running test</p>
      <p>You can stop the test by clicking on the respective button. The test of the model is cancelled. If you restart
        the test, the previous data is overwritten.</p>
      <p>&#160;</p>
      <h1><a name="Step_4:_Validate"></a>Step 4: Validate</h1>
      <p>When you finished testing the model, you can start validating the AI model.</p>
      <p>→ Click on the Validate button in the top bar.</p>
      <p>→ Make sure that the correct work space is indicated.</p>
      <p>→ Click on the button Run validate batch.</p>
      <p>The validation can take an extended period of time based on the number of images you classified. The more
        images
        you classified, the longer the validation takes. The status of the validation is displayed above the button Run
        validate batch.</p>
      <p>→ Review the results by opening the confusion matrix.</p>
      <p>→ When the validation is finished, the AI model is ready for implementation in SVObserver.</p>
      <p style="text-decoration: underline;">Stop running validate</p>
      <p>You can stop the validation by clicking on the respective button. The validation of the model is cancelled. If
        you restart the training, the previous model is overwritten.</p>
      <p style="text-decoration: underline;">Run export</p>
      <p>You can export the AI model for usage within the run directory of SVObserver.</p>
      <p style="text-decoration: underline;">Export images</p>
      <p>You can export the images used for the validation to a default folder.</p>
      <p>&#160;</p>
    </div>
  </div>
  </div>
</template>
<script>
export default {
  name: 'Help',
  data() {
    return {
      version: '1.3',
    }
  },
}
</script>

<style scoped>
body
{
  font-family: Arial;
  font-size: 11pt;
}

/* Content */

img
{
  border: 1px solid black;
  max-width: 100%;
}

.img-title
{
  border: none;
  max-width: 100%;
}

p
{
  font-family: Arial;
  font-size: 11pt;
}

p.title
{
  margin-top: 30px;
  font-size: 24pt;
  line-height: 30pt;
}

/* Headings */

h1
{
  font-weight: bold;
  font-size: 24.0pt;
  margin-top: 2rem;
  margin-bottom: 0;
}

h2
{
  font-weight: bold;
  font-size: 18.0pt;
  margin-top: 0;
  margin-bottom: 0;
}

h3
{
  font-weight: bold;
  font-size: 14.0pt;
  margin-top: 0;
  margin-bottom: 0;
}

h4
{
  font-weight: bold;
  font-size: 12.0pt;
  margin-top: 0;
  margin-bottom: 1.12em;
}

h5
{
  font-weight: bold;
  font-size: 10.0pt;
}

h6
{
  font-weight: bold;
  font-size: 8.0pt;
}

p.Zwischen\0000FCberschrift
{
  font-size: 16pt;
  font-weight: bold;
  margin-top: 1.5em;
  line-height: 1.5em;
}

h6
{
  margin-top: 0;
  margin-bottom: 0;
  color: #000000;
}

h5
{
  color: #000000;
}

p.Zwischen\0000FCberschrift
{
  font-family: Arial;
  margin-bottom: 0;
  font-weight: bold;
  font-size: 20pt;
  page-break-after: avoid;
  line-height: 1.5em;
  margin-top: 1.5em;
}

table {
  border-collapse: collapse;
}

table, th, td {
  border: 1px solid black;
}
</style>
