//TODO: clean up code to determine when things are undefined or an empty string in the JSON file, can be more consistent with this, can improve the whole data structure too, talents don't need to refer to spells although it also makes sense
//TODO: update serrated blades tooltip per level: ref. https://github.com/hseager/Classic-WoW-Talent-Planner/issues/16
//TODO: full functionality of building the tree, adding conditions, level required and path of talents you chose, export link..., although that's a bit overkill for our use case of just showcasing the new class design
// because then we should kind of use a framework like react or vue

import druidTalents from "../data/druidTalents.json";
import hunterTalents from "../data/hunterTalents.json";
import mageTalents from "../data/mageTalents.json";
import paladinTalents from "../data/paladinTalents.json";
import priestTalents from "../data/priestTalents.json";
import rogueTalents from "../data/rogueTalents.json";
import shamanTalents from "../data/shamanTalents.json";
import warlockTalents from "../data/warlockTalents.json";
import warriorTalents from "../data/warriorTalents.json";

import "../css/styles.css";
import $ from "jquery";

const totalMaxTalentPoints = 51

let totalTalentPoints;

let totalTab1TalentPoints = 0;
let totalTab2TalentPoints = 0;
let totalTab3TalentPoints = 0;

let currentTalentSpellID;
let currentTalentTopPosition;
let currentTalentLeftPosition;

let talentTrees ={ 
  class1: { name:"druid", spec1:"Balance", spec2:"Feral Combat", spec3:"Restoration", 
            talentTree:"" },
  class2: { name:"hunter", spec1:"Beast Mastery", spec2:"Marksmanship", spec3:"Survival",
            talentTree:"" },
  class3: { name:"mage", spec1:"Arcane", spec2:"Fire", spec3:"Frost", 
            talentTree:"" },
  class4: { name:"paladin", spec1:"Holy", spec2:"Protection", spec3:"Retribution", 
            talentTree:"" },
  class5: { name:"priest", spec1:"Discipline", spec2:"Holy", spec3:"Shadow", 
            talentTree:"" },
  class6: { name:"rogue", spec1:"Assassination", spec2:"Combat", spec3:"Subtlety", 
            talentTree:"" },
  class7: { name:"shaman", spec1:"Elemental", spec2:"Enhancement", spec3:"Restoration", 
            talentTree:"" },
  class8: { name:"warlock", spec1:"Affliction", spec2:"Demonology", spec3:"Destruction",
            talentTree:"" },
  class9: { name:"warrior", spec1:"Arms", spec2:"Fury", spec3:"Protection", 
            talentTree:"" },
}

let currentTalentTree;
let currentClassID;
let talentTreeLoaded = false;

//When window has loaded
$(window).on("load", function () {
 initialize();
});

function initialize() {

  $(".calculator-splash-inner .icon").css("opacity",1);

  $(".calculator-splash-inner .icon").on("mouseover", function(){
    let boundingRect;
    let className = talentTrees[$(this).attr("data-class-name")]["name"];
    let topPosition;
    let leftPosition;

    boundingRect = $(this)[0].getBoundingClientRect();
    topPosition = boundingRect.top - 20;
    leftPosition = boundingRect.left + 42;

    showMiniTooltip(className,topPosition,leftPosition);
  });
  
  $(".calculator-splash-inner .icon").on("mouseout", function(){
    $(".mini-tooltip").hide();
  });

  $(".calculator-splash-inner .icon").on("click",function(){

    $(".calculator-splash-inner .icon").removeAttr("style");

    $(".calculator-tree-container, .calculator-tree-reset-all").show();

    $(".calculator-splash-inner .selected").removeClass("selected");

    $(this).addClass("selected");

    let className = $(this).attr("data-class-name");
    let classActualName = talentTrees[$(this).attr("data-class-name")]["name"];
    $(".class-name-title").text(classActualName.charAt(0).toUpperCase() + classActualName.slice(1));

    $(".class-name-title").attr("data-class-color",classActualName);

    loadTalentTree(className);

  })
}

function loadTalentTree(classID) {

  if(currentClassID == classID) {
    return;
  }
  
  totalTalentPoints = 0;
  
  totalTab1TalentPoints = 0;
  totalTab2TalentPoints = 0;
  totalTab3TalentPoints = 0;
  
  //check if we didn't already load this JSON in the talentTree property
  if(talentTrees[classID]["talentTree"] == "") {

    switch (classID) {
      case "class1":
        currentTalentTree = druidTalents;
        talentTrees[classID]["talentTree"] = druidTalents;
        break;
      case "class2":
        currentTalentTree = hunterTalents;
        talentTrees[classID]["talentTree"] = hunterTalents;
        break;
      case "class3":
        currentTalentTree = mageTalents;
        talentTrees[classID]["talentTree"] = mageTalents;
        break;
      case "class4":
        currentTalentTree = paladinTalents;
        talentTrees[classID]["talentTree"] = paladinTalents;
        break;
      case "class5":
        currentTalentTree = priestTalents;
        talentTrees[classID]["talentTree"] = priestTalents;
        break;
      case "class6":
        currentTalentTree = rogueTalents;
        talentTrees[classID]["talentTree"] = rogueTalents;
        break;
      case "class7":
        currentTalentTree = shamanTalents;
        talentTrees[classID]["talentTree"] = shamanTalents;
        break;
      case "class8":
        currentTalentTree = warlockTalents;
        talentTrees[classID]["talentTree"] = warlockTalents;
        break;
      case "class9":
        currentTalentTree = warriorTalents;
        talentTrees[classID]["talentTree"] = warriorTalents;
        break;
      default:
        break;
    }

      currentClassID = classID

      buildTalentTree();
  }
  //If we did load the JSON, but we didn't build the tree yet, cause we swapped back from another class, build the tree, it's in the talentTrees object
  else if (classID != currentClassID){
    currentTalentTree = talentTrees[classID]["talentTree"];
    currentClassID = classID;
    buildTalentTree();
  }
}

function CalculateTotalTalentPoints() {

  totalTalentPoints = 0;

  $("#s4 .calculator-tree-talent-points").each(function (index) {
    let points = 0;
    points = Number($(this).text().split("/", 1));
    totalTalentPoints = totalTalentPoints + points;
  });

  if(totalTalentPoints == totalMaxTalentPoints) {
    //lock the talent trees
    //$(".calculator-tree-talent").off("mousedown");
  }
}

function buildTalentTree() {

  //clear out the previous talents if any, update the headers and splash arts
  if($(".calculator-tree-talents").children() != null) {
    $(".calculator-tree-talents").empty();
  }

  //Headers
  $(".calculator-tree[data-tab='0'] b").text(talentTrees[currentClassID]["spec1"]);
  $(".calculator-tree[data-tab='1'] b").text(talentTrees[currentClassID]["spec2"]);
  $(".calculator-tree[data-tab='2'] b").text(talentTrees[currentClassID]["spec3"]);
  $(".calculator-tree[data-tab='0'] .calculator-tree-header-points").text("0 / 51");
  $(".calculator-tree[data-tab='1'] .calculator-tree-header-points").text("0 / 51");
  $(".calculator-tree[data-tab='2'] .calculator-tree-header-points").text("0 / 51");

  //now build all the talents
  $.each(currentTalentTree["talentTree"], function (key, value) {

    let icon = require("../img/" + value["icon"] + "?as=webp&width=64&height=64");

    let selector = "#s4 [data-tab='" + value["talentTab"] + "']" + " .calculator-tree-talents";

    let attributeID = " data-id='" + value["spellRanks"]["spellRank1"] + "'";
    let attributeRow = " data-row='" + value["position"][0] + "'";
    let attributeCol = " data-col='" + value["position"][1] + "'";
    let attributeMaxPoints = " data-max-points='" + value["maxTalentPoints"] + "'";
    let attributeName = "data-name='" + value["talentName"] + "'";
    //Filter out single quotes from attribute name, like from Nature's Grasp for example and add a hyphen for spaces
    attributeName = attributeName.replace(/ /g, "-");
    attributeName = attributeName.replace(/'/g, "").toLowerCase();
    
    let talentID = " id='talent-" + value["id"] + "'";

    let element1 = "<div" + talentID + " class=\"calculator-tree-talent\"" + attributeID + attributeRow + attributeCol + attributeMaxPoints + " " + attributeName + " data-points=\"\"></div>";
    let element2 = "<div class=\"icon\"></div>";
    let element3 = "<ins style=\"background-image: url(&quot;" + icon + "&quot;);\"></ins>"
    let element4 = "<del></del>"
    // let element5 = "<a href=\"https://www.wowhead.com/classic/spell=" + value["spellRanks"]["spellRank1"] + "\"></a>"
    let element5 = "<a></a>"
    let element6 = "<span class=\"calculator-tree-talent-points\" style=\"pointer-events: none;\">" + 0 + "/" + value["maxTalentPoints"] + "</span>";

    //Talents with a prerequired talent need an arrow connecting to them
    //example arrow: <div class="calculator-tree-talent-arrow calculator-tree-talent-arrow-down" data-talent="721" data-col="2" data-row="2" data-size="3" style="z-index: 2;"></div>
    if(value["prereqTalent1"] != null) {

      let id = value["prereqTalent1"];
      let startTalent = currentTalentTree["talentTree"].filter(e => e.id == id);
      let startRow = startTalent[0]["position"][0];
      let startCol = startTalent[0]["position"][1];

      let arrowLength;
      let arrowWidth;
      let elementArrow;

      //Left or right arrows, so where two connected talents are on the same row but different columns
      if(value["position"][0] == startRow) {
        //check if it's a left or right arrow

        //(there are originally no left arrows and we didnd't add a talent that needs it so don't need to check for now)

        arrowLength = value["position"][1] - startCol;
        elementArrow = "<div class=\"calculator-tree-talent-arrow calculator-tree-talent-arrow-right\" data-col=\"" + startCol +  "\" data-row=\""+ startRow + "\" data-size=\"" + arrowLength + "\"></div>"

      }

      //Angular arrows, so where two connected talents are on different rows AND columns
      if(value["position"][0] != startRow && value["position"][1] != startCol) {
        //check if it's a left or right arrow

        //(there are originally no left arrows and we didnd't add a talent that needs it so don't need to check for now)

        arrowLength = value["position"][0] - startRow;
        arrowWidth = value["position"][1] - startCol;
        elementArrow =  "<div class=\"calculator-tree-talent-arrow calculator-tree-talent-arrow-right-down\" data-col=\"" + startCol +  "\" data-row=\""+ startRow + "\" data-width=\"" + arrowWidth + "\" data-height=\"" + arrowLength + "\"><div></div><div></div></div>"

      }

      //Arrows going straight down, so where two connected talents are on different rows but the same column
      if(value["position"][1] == startCol) {

        arrowLength = value["position"][0] - startRow;
        elementArrow = "<div class=\"calculator-tree-talent-arrow calculator-tree-talent-arrow-down\" data-col=\"" + startCol +  "\" data-row=\""+ startRow + "\" data-size=\"" + arrowLength + "\"></div>"
  
      }

      $(selector).append(elementArrow);

    }

    $("#s4").attr("data-class-name",talentTrees[currentClassID]["name"]);

    //Add the spec name for the CSS to set the header icon and background image, need to do this after the trees are built
    $("#s4 [data-tab=0]").attr("data-spec-name",talentTrees[currentClassID]["spec1"].toLowerCase());
    $("#s4 [data-tab=1]").attr("data-spec-name",talentTrees[currentClassID]["spec2"].toLowerCase());
    $("#s4 [data-tab=2]").attr("data-spec-name",talentTrees[currentClassID]["spec3"].toLowerCase());

    $(selector).append(element1);
    $(selector + " .calculator-tree-talent").last().append(element2).append(element6);
    $(selector + " .calculator-tree-talent .icon").last().append(element3).append(element4).append(element5);

  });

  setEventHandlers();

}

function setEventHandlers() {


  //Cant use .toggle() cause mouseover gets called twice on hover cause the html is scuffed?
  $(".calculator-tree-talent[data-name]").on("mouseover", function () {

    currentTalentSpellID = $(this).attr("data-id");

    //We gotta build the whole tooltip first so we can use its height to get the positioning right
    buildTooltip(currentTalentSpellID);

    let boundingRect;

    boundingRect = $(this)[0].getBoundingClientRect();

    let iconWidth = 44;

    let tooltip = $("#" + currentTalentSpellID);

    currentTalentTopPosition = boundingRect.top - tooltip.height() - 9;
    currentTalentLeftPosition = boundingRect.left + iconWidth - 2;

    showTooltip(currentTalentSpellID, currentTalentTopPosition, currentTalentLeftPosition);

  });

  $(".calculator-tree-talent[data-name]").on("mouseout", function () {
    
    let id;

    id = $(this).attr("data-id");

    let tooltip = $("#" + id)

    $(tooltip).hide();

  });

  //prevent context menu from popping up on right clicking
  $(".calculator-tree-talent").on("contextmenu",function(e){
    return false;
  });

  $(".calculator-tree-talent").on("mousedown", function(e) {
    switch (e.which) {
        case 1:
            //Left click
            addTalentPoint(this);
            break;
        case 2:
            //Middle mouse button
            break;
        case 3:
            //Right click
            removeTalentPoint(this);
            break;
        default:
            //You have a strange mouse
            break;
    }
  });

  $(".calculator-tree-talent-arrow").on("click", function(){   
    $(this).attr("data-lit", function(index, attr){
      return attr == 1 ? null : 1;
    });
  });

  $(".calculator-tree-reset").on("click", function(){
    //Figure out which tree tab we're in
    let tab = $(this).parent().attr("data-tab");
    resetTree(tab)
  });

  $(".calculator-tree-reset-all").on("click", function(){
    resetTree("0");
    resetTree("1");
    resetTree("2");
  });

  $("a").on("click", function (e) {
    e.preventDefault();
  });

}

function addTalentPoint(clickedTalent) {

  if(totalTalentPoints == totalMaxTalentPoints) {
    return;
  }

  let currentTalent;
  let currentTalentPoints = 0;
  let maxTalentPoints = 0;
  let talentTab;

  //Get the current points talent has
  currentTalentPoints = $(clickedTalent).attr("data-points");
  maxTalentPoints = $(clickedTalent).attr("data-max-points");

  currentTalentPoints++;

  if (currentTalentPoints > maxTalentPoints) {
    return;
  }

  if (currentTalentPoints == maxTalentPoints) {
    $(clickedTalent).addClass("calculator-at-max");
  }

  //Check in which of the 3 talent tabs we're in to add the total points per tree at the top
  talentTab = $(clickedTalent).parents(".calculator-tree").attr("data-tab");

  switch (talentTab) {
    case "0":
      totalTab1TalentPoints++;
      $(".calculator-tree" + "[data-tab='" + talentTab + "']" + " .calculator-tree-header-points").text(totalTab1TalentPoints + " / 51");
      break;
    case "1":
      totalTab2TalentPoints++;
      $(".calculator-tree" + "[data-tab='" + talentTab + "']" + " .calculator-tree-header-points").text(totalTab2TalentPoints + " / 51");
      break;
    case "2":
      totalTab3TalentPoints++;
      $(".calculator-tree" + "[data-tab='" + talentTab + "']" + " .calculator-tree-header-points").text(totalTab3TalentPoints + " / 51");
      break;
    default:
      break;
  }

  //Set the added point
  $(clickedTalent).attr("data-enabled", 1);
  $(clickedTalent).attr("data-points", currentTalentPoints);

  $("span", clickedTalent).text((currentTalentPoints) + "/" + maxTalentPoints)

  //Update tooltip now that the rank went up
  //Get the ID of the next spell rank
  let id =  $(clickedTalent).attr("id").replace("talent-","");
  let talent = currentTalentTree["talentTree"].filter(e => e.id == id);
  let spellID =talent[0]["spellRanks"]["spellRank"+ currentTalentPoints];
  $(clickedTalent).attr("data-id",spellID);

  buildTooltip(spellID);

  CalculateTotalTalentPoints();

}

function removeTalentPoint(clickedTalent) {

  let currentTalent;
  let currentTalentPoints = 0;
  let maxTalentPoints = 0;
  let talentTab;

  currentTalentPoints = $(clickedTalent).attr("data-points");
  maxTalentPoints = $(clickedTalent).attr("data-max-points");

  currentTalentPoints--;

  if (currentTalentPoints < 0) {
    return;
  }

  if (currentTalentPoints == 0) {
    $(clickedTalent).removeAttr("data-enabled");
  }

  if (currentTalentPoints < maxTalentPoints) {
    $(clickedTalent).removeClass("calculator-at-max");
  }

  //Check in which of the 3 talent tabs we're in to add the total points per tree at the top
  talentTab = $(clickedTalent).parents(".calculator-tree").attr("data-tab");

  switch (talentTab) {
    case "0":
      totalTab1TalentPoints--;
      $(".calculator-tree" + "[data-tab='" + talentTab + "']" + " .calculator-tree-header-points").text(totalTab1TalentPoints + " / 51");
      break;
    case "1":
      totalTab2TalentPoints--;
      $(".calculator-tree" + "[data-tab='" + talentTab + "']" + " .calculator-tree-header-points").text(totalTab2TalentPoints + " / 51");
      break;
    case "2":
      totalTab3TalentPoints--;
      $(".calculator-tree" + "[data-tab='" + talentTab + "']" + " .calculator-tree-header-points").text(totalTab3TalentPoints + " / 51");
      break;
    default:
      break;
  }

  $(clickedTalent).attr("data-points", currentTalentPoints);

  $("span", clickedTalent).text((currentTalentPoints) + "/" + maxTalentPoints)

  //update tooltip now that the rank went down
  //Get the ID of the next spell rank
  let id =  $(clickedTalent).attr("id").replace("talent-","");
  let talent = currentTalentTree["talentTree"].filter(e => e.id == id);
  let spellID =talent[0]["spellRanks"]["spellRank"+ currentTalentPoints];
  $(clickedTalent).attr("data-id",spellID);

  //Don't rebuild the tooltip if the rank is at 0, keep showing the rank 1, otherwise we get an error in buildTooltip() cause there is no rank 0
  if(currentTalentPoints > 0){
    buildTooltip(spellID);
  }

  CalculateTotalTalentPoints();
}

function resetTree(tab) {

  let talents = $(".calculator-tree[data-tab=\"" + tab + "\"] .calculator-tree-talents").children("[id]");

  let talentPointsSpent = 0;

  //Unlit all arrows
  $(".calculator-tree[data-tab=\"" + tab + "\"] .calculator-tree-talent-arrow[data-lit='1']").removeAttr("data-lit");

  //Reset the header
  $(".calculator-tree[data-tab=\"" + tab + "\"] .calculator-tree-header-points").text("0 / 51");

  for (let index = 0; index < talents.length; index++) {
    let talent = talents[index];
    let maxTalentPoints = $(talent).attr("data-max-points");

    talentPointsSpent = talentPointsSpent + Number($(talent).attr("data-points"));

    $(talent).removeClass("calculator-at-max").attr("data-points","0").removeAttr("data-enabled");
    $(talent).find("span").text("0/"+ maxTalentPoints);
  }

  switch (tab) {
    case "0":
      totalTab1TalentPoints = 0;
    break;
    case "1":
      totalTab2TalentPoints = 0;
    break;
    case "2":
      totalTab3TalentPoints = 0;
    break;
  }

  totalTalentPoints = totalTalentPoints - talentPointsSpent;
}

function buildTooltip(id) {

  let talent = currentTalentTree["talentSpells"].filter(e => e.id == id);

  let talentName = talent[0]["spellName"];
  let talentRank = talent[0]["spellRank"];
  let talentRequirements = talent[0]["requirements"];
  let tooltip = talent[0]["tooltip"];
  let talentResourceCost = talent[0]["resourceCost"];
  let talentCooldown = talent[0]["cooldown"];
  let talentCastTime = talent[0]["castTime"];
  let talentRange = talent[0]["range"];

  //Should try catch all this stuff, like what if we did by accident make some properties in the JSON a type that it never can be?

  //Talent id
  $(".tooltip-template").attr("id",id);
  //Talent name
  $(".tooltip-template .tooltip-name b").text(talentName);

  //Talent rank, it's possible the rank is 0, then we don't want to show this element
  if(talentRank != 0 && (typeof talentRank) != "string") {
    $(".tooltip-template .tooltip-rank b").text("Rank " + talentRank);
  }
  if(talentRank == 0) {
    $(".tooltip-template .tooltip-rank b").text(null);
  }
  //In rare cases it's a string (e.g. Shapeshift)
  if((typeof talentRank) == "string") {
    $(".tooltip-template .tooltip-rank b").text(talentRank);
  }

  //Talent requirements
  //Clear the previous ones
  $("tr[class^='tooltip-requirements']").remove();

  $.each(talentRequirements,function(index,value){
    let htmlString = "<tr class=\"tooltip-requirements-" + (index + 1) + "\"><td colspan=\"2\"></td></tr>";
    $(htmlString).appendTo(".tooltip-template .table-1 tbody");
    $(".tooltip-template .tooltip-requirements-" + (index + 1) + " td").text(value);
  })

  $(".optional-row1").hide();
  $(".optional-row2").hide();

  //Talent tooltip, we use .html here because sometimes we want to add <br> tags or &nbsp; in the string in the JSON file
  $(".tooltip-template .tooltip-description").html(tooltip);

  //Clear previous tooltip stuff
  $(".tooltip-template .tooltip-cast-time").text(null);
  $(".tooltip-template .tooltip-cooldown").text(null);
  $(".tooltip-template .tooltip-resource-cost").text(null)
  $(".tooltip-template .tooltip-range").text(null);

  //If it's not a passive talent it will have a cast time, cooldown and maybe a resource cost or more requirements(stealth, totem...) or cast range
  if(talentCastTime != "") { 
    //Sometimes the resource cost is free then we don't need to set that element
    if(talentResourceCost != "") {
      //Gotta show the optional rows, normally they're hidden for styling reasons
      $(".optional-row1").show();

      $(".tooltip-template .tooltip-resource-cost").text(talentResourceCost);
    }

    //Range
    if(talentRange != "" && talentResourceCost != "") {
      $(".optional-row1").show();

      $(".tooltip-template .tooltip-range").text(talentRange);
    }
    //It's possible there's no resource cost but a range, e.g Premeditation from the Rogue, then we want to move the range value into the resource cost cell
    if(talentRange != "" && talentResourceCost == "") {
      $(".optional-row1").show();

      $(".tooltip-template .tooltip-resource-cost").text(talentRange);
    }

    $(".optional-row2").show();

    $(".tooltip-template .tooltip-cast-time").text(talentCastTime);

    //Cooldown
    if(talentCooldown != "") {
      $(".optional-row2").show();
      $(".tooltip-template .tooltip-cooldown").text(talentCooldown + " cooldown");
    }

    //Sometimes there's no resource cost and no range but it is a spell(e.g Amplify Curse)
    if(talentResourceCost == "" && talentRange == undefined) {
      $(".optional-row1").hide();
    }
  }
}

function showTooltip(id, topPosition, leftPosition) {

  let tooltip = $("#" + id);

  $(tooltip).css("top", topPosition).css("left", leftPosition).css("visibility", "visible");
  $(tooltip).show();

}

function showMiniTooltip(className, topPosition, leftPosition){
  
  $(".mini-tooltip b").text(className.charAt(0).toUpperCase() + className.slice(1));
  $(".mini-tooltip b").attr("data-class-color",className);
  $(".mini-tooltip").css("top", topPosition).css("left", leftPosition)
  $(".mini-tooltip").show();
}


