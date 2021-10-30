// JQuery ready function: Code placed inside ready function so will be executed when the page is ready.
$(document).ready(function () {
  // Elements added by for Wikipedia.
  let wikiParagraph = document.getElementById("wiki-desc");
  let wikiLink = document.getElementById("wiki-link");

  const searchBtn = document.getElementById("btn");
  let time = Date.now();
  const publicKey = "c598176713a7f4af235c955e6ab2cdf5";
  const privateKey = "21fe2681db8292d452bae0ffe9b07fb96a43fc39";
  const comicDivEl = $("#comic-area");
  const input = document.getElementById("input");
  const searchHistory = document.getElementById("search-history");
  let history = [];

  //grabs a hash so you can use the marvel api
  function getHash(hero) {
    const hash = time + privateKey + publicKey;
    fetch("https://api.hashify.net/hash/md5/hex?value=" + hash)
      .then(function (data) {
        return data.json();
      })
      .then(function (md5) {
        genHash = md5.Digest;

        heroSearch(genHash, hero);
      });
  }

  //searches the marvel api for the hero
  function heroSearch(hash, hero) {
    if (
      hero === "Spiderman" ||
      hero === "Spider Man" ||
      hero === "Spider-Man"
    ) {
      url = "https://gateway.marvel.com/v1/public/characters/1009610?";
    } else {
      url =
        "https://gateway.marvel.com/v1/public/characters?name=" + hero + "&";
    }
    fetch(url + "apikey=" + publicKey + "&hash=" + hash + "&ts=" + time)
      .then(function (response) {
        if (!response.ok) {
          throw response.json();
        }

        return response.json();
      })
      .then(function (data) {
        if (data.data.count === 0) {
          return myAlert();
        } else {
          if (history.includes(hero)) {
          } else {
            history.unshift(hero);
          }
          renderCharData(data, hash);
          getWikiPageID(hero);
          renderHistory();
        }
      });
  }

  //uses the marvel api data to render the main character info
  function renderCharData(data, hash) {
    const charName = data.data.results[0].name;
    const charDesc = data.data.results[0].description;
    const charComics = data.data.results[0].comics.available;
    const charSeries = data.data.results[0].series.available;
    const charStories = data.data.results[0].stories.available;
    const charComicsUrl = data.data.results[0].comics.collectionURI;
    const extension = data.data.results[0].thumbnail.extension;
    const pic = data.data.results[0].thumbnail.path;
    $("#char-pic").attr({
      src: pic + "." + extension,
      alt: "Picture of " + charName,
    });
    $("#char-name").text("Character Name: " + charName);
    $("#marvel-desc").text(charDesc);
    $("#numCom").text("Number of Comics: " + charComics);
    $("#numSer").text("Number of Series: " + charSeries);
    $("#numStor").text("Number of Stories: " + charStories);

    getComicData(charComicsUrl, hash);
  }

  //gets the data for the comics
  function getComicData(url, hash) {
    url = url.slice(4);
    url = "https" + url;
    fetch(url + "?apikey=" + publicKey + "&hash=" + hash + "&ts=" + time)
      .then(function (response) {
        if (!response.ok) {
          throw response.json();
        }

        return response.json();
      })
      .then(function (data) {
        renderComics(data, hash);
      });
  }

  //renders the comic cards down below
  function renderComics(data, hash) {
    comicDivEl.empty();
    for (let i = 0; i < 5; i++) {
      const title = data.data.results[i].title;
      const pic =
        data.data.results[i].thumbnail.path +
        "." +
        data.data.results[i].thumbnail.extension;
      const description = data.data.results[i].description;
      const characters = data.data.results[i].characters.items;
      const comicEl = $("<div>").addClass("col");
      const comicPicEl = $("<img>")
        .addClass("col")
        .attr({ src: pic, alt: "Picture of comic cover" });
      const comicInfoEl = $("<div>").addClass("col");
      const comicTitleEl = $("<p>").text(title);
      const comicDescEl = $("<p>").text(description);
      const comicCharactersEl = $("<p>");
      for (let i = 0; i < characters.length; i++) {
        let url = characters[i].resourceURI;
        url = url.slice(4);
        url = "https" + url;
        const character = $("<button>")
          .text(characters[i].name)
          .attr("url", url)
          .addClass(
            "search_btn ring-2 ring-red-600 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          );
        character.click(function (e) {
          $("html").scrollTop(0);
          fetch(url + "?apikey=" + publicKey + "&hash=" + hash + "&ts=" + time)
            .then(function (response) {
              if (!response.ok) {
                throw response.json();
              }

              return response.json();
            })
            .then(function (data) {
              if (history.includes(characters[i].name)) {
              } else {
                history.unshift(characters[i].name);
              }
              renderHistory();
              renderCharData(data, hash);
              getWikiPageID(characters[i].name);
            });
        });
        comicCharactersEl.append(character);
      }
      comicInfoEl.append(comicTitleEl, comicDescEl, comicCharactersEl);
      comicEl.append(comicPicEl, comicInfoEl);
      comicDivEl.append(comicEl);
    }
  }

  //This is the event listener for the main Search Bar
  searchBtn.addEventListener("click", function (e) {
    e.preventDefault();

    let searchInput = document.getElementById("input").value.toLowerCase();

    searchInput = searchInput.trim();

    // If no character name was entered then display the JQuery Modal Dialog Box.
    if (searchInput.length === 0) {
      myAlert();

      return;
    }

    //Capitalizes the first worst of every search
    searchArray = searchInput.split(" ");
    for (var i = 0; i < searchArray.length; i++) {
      searchArray[i] =
        searchArray[i].charAt(0).toUpperCase() + searchArray[i].slice(1);
    }

    searchCaps = searchArray.join(" ");

    //turns a spiderman search into the main spiderman search
    if (
      searchCaps === "Spiderman" ||
      searchCaps === "Spider Man" ||
      searchCaps === "Spider-Man"
    ) {
      searchCaps = "Spider-Man (Peter Parker)";
    }

    //renderHistory();
    getHash(searchCaps);
  });

  function myAlert() {
    $("#dialog").text("You must enter a Marvel Character!");
    $("#dialog").dialog({
      modal: true,
      title: "Marvel Comics",
      buttons: [
        {
          text: "Ok",
          click: function () {
            $(this).dialog("close");
          },
        },
      ],
    });
  }
  // SECTION START: Start of Wikipedia Code : //////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function: StartWordWithCapitalLetter - This function will take the word passed in, Make the first character upper case, set all the
  // rest of the characters to lower case and return the word to the calling function.
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function StartWordWithCapitalLetter(szWord) {
    let szTemp = "";

    // Make the first character in the word uppercase.
    szTemp = szWord.substring(0, 1).toUpperCase();

    // Set all of the rest of the characters in the word to lowercase.
    szTemp += szWord.substring(1).toLowerCase();
    return szTemp;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function: getWikiPageID - This function will call the Wikipedia API to get the page ID for the page that match the page text passed in
  // the PARSE command.  This command is done four times, examples for "Ant Man" character shown below:
  //
  // 1. "Ant_Man_(Marvel_Comics)"
  // 2. "Ant_Man_(comics)"
  // 3. "Ant_Man_(character)"
  // 4. "Ant_Man"
  //
  // If a parse object is returned then the function GetWikiData is called passing in the Page Id value.
  // If a parse object is never returned then the function WikiPageNotFound is called.
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function getWikiPageID(szCharacter) {
    let requestUrl = "";
    let page_response = null;
    let page_data = null;
    let page_response2 = null;
    let page_data2 = null;
    let page_response3 = null;
    let page_data3 = null;
    let page_response4 = null;
    let page_data4 = null;
    let szWikiName = "";
    let szBuffer = "";
    let szStorage = "";
    let nPos = 0;
    let szWord = "";
    let nStartPos = 0;

    // Look for space followed by ( in string like "Spider-Man (Peter Parker)" and truncate the string
    // at the space before the ( left bracket character.
    nPos = szCharacter.indexOf(" (");
    if (nPos != -1) {
      szCharacter = szCharacter.substring(0, nPos);
    }

    // Format the character name string passed into this function.
    // Pull out each word and make the first letter capital and all the rest lower case.
    // Set the Buffer string to an empty string.
    szBuffer = "";

    // Set the storage string to the Character string value.
    szStorage = szCharacter;

    // look for a space in the storage string.
    nPos = szStorage.indexOf(" ");

    if (nPos === -1) {
      // Call the function to format the word to start with a capital letter.
      szBuffer = StartWordWithCapitalLetter(szCharacter);
    } else {
      // Perform the following operations if a space character was found
      while (nPos != -1) {
        // If the buffer already contains a word then add a space after it.
        if (szBuffer.length > 0) {
          szBuffer += " ";
        }

        // Get the word from the storage string.
        szWord = szStorage.substring(nStartPos, nPos);

        // Add the modified Word to the buffer string.
        szBuffer += StartWordWithCapitalLetter(szWord);

        // Adjust the start postion value and put the rest of the string into the storage string.
        nStartPos = nPos + 1;
        szStorage = szStorage.substring(nStartPos);

        // look for a space in the storage string.
        nPos = szStorage.indexOf(" ");

        // if a space was not found then add the modified word to the buffer string.
        if (nPos == -1) {
          szBuffer += " ";

          // Call the function to format the word to start with a capital letter.
          szBuffer += StartWordWithCapitalLetter(szStorage);
        }
        // Otherwise reset the start position for the new word to zero.
        else {
          nStartPos = 0;
        }
      }
    }

    // Set the Wiki Name string equal to the contents of the Buffer string.
    szWikiName = szBuffer;

    // Replace any space characters with the underline character.
    szWikiName = szWikiName.replace(/ /gi, "_");

    ///////////////////////////////////////////////////////////////////////////////////////
    // Perform a PARSE action.  Looking for szWikiName + "_(Marvel_Comics)".
    //////////////////////////////////////////////////////////////////////////////////////
    requestUrl =
      "https://en.wikipedia.org/w/api.php?origin=*&action=parse&prop=text&redirects=1&page=";
    requestUrl += szWikiName + "_(Marvel_Comics)&format=json";

    // Replace any space character with the text string "%20".
    requestUrl = requestUrl.replace(/ /gi, "%20");

    fetch(requestUrl)
      // Get the page response.
      .then(function (page_response) {
        if (page_response.ok) {
          return page_response.json();
        } else {
          // If the response was not ok then throw an error.
          throw new Error(page_response.status);
        }
      })

      // Get the page data.
      .then(function (page_data) {
        if (page_data.parse != undefined) {
          GetWikiData(page_data.parse.pageid);
        } else {
          ///////////////////////////////////////////////////////////////////////////////////////
          // Perform a PARSE action.  Looking for szWikiName + "_(comics)"".
          //////////////////////////////////////////////////////////////////////////////////////
          requestUrl =
            "https://en.wikipedia.org/w/api.php?origin=*&action=parse&prop=text&redirects=1&page=";
          requestUrl += szWikiName + "_(comics)&format=json";

          // Replace any space character with the text string "%20".
          requestUrl = requestUrl.replace(/ /gi, "%20");

          fetch(requestUrl)
            // Get the page response.
            .then(function (page_response2) {
              if (page_response2.ok) {
                return page_response2.json();
              } else {
                // If the response was not ok then throw an error.
                throw new Error(page_response2.status);
              }
            })

            // Get the page data.
            .then(function (page_data2) {
              if (page_data2.parse != undefined) {
                GetWikiData(page_data2.parse.pageid);
              } else {
                ///////////////////////////////////////////////////////////////////////////////////////
                // Perform a PARSE action.  Looking for szWikiName + "_(character)".
                //////////////////////////////////////////////////////////////////////////////////////
                requestUrl =
                  "https://en.wikipedia.org/w/api.php?origin=*&action=parse&prop=text&redirects=1&page=";
                requestUrl += szWikiName + "_(character)&format=json";

                // Replace any space character with the text string "%20".
                requestUrl = requestUrl.replace(/ /gi, "%20");

                fetch(requestUrl)
                  // Get the page response.
                  .then(function (page_response3) {
                    if (page_response3.ok) {
                      return page_response3.json();
                    } else {
                      // If the response was not ok then throw an error.
                      throw new Error(page_response3.status);
                    }
                  })

                  // Get the page data.
                  .then(function (page_data3) {
                    // If a parse object was not returned then call function to display page not found.
                    if (page_data.parse != undefined) {
                      GetWikiData(page_data3.parse.pageid);
                    } else {
                      ///////////////////////////////////////////////////////////////////////////////////////
                      // Perform a PARSE action.  Looking for szWikiName.
                      //////////////////////////////////////////////////////////////////////////////////////
                      requestUrl =
                        "https://en.wikipedia.org/w/api.php?origin=*&action=parse&prop=text&redirects=1&page=";
                      requestUrl += szWikiName + "&format=json";

                      // Replace any space character with the text string "%20".
                      requestUrl = requestUrl.replace(/ /gi, "%20");

                      fetch(requestUrl)
                        // Get the page response.
                        .then(function (page_response4) {
                          if (page_response4.ok) {
                            return page_response4.json();
                          } else {
                            // If the response was not ok then throw an error.
                            throw new Error(page_response4.status);
                          }
                        })

                        // Get the page data.
                        .then(function (page_data4) {
                          // If a parse object was not returned then call function to display page not found.
                          if (page_data4.parse != undefined) {
                            GetWikiData(page_data4.parse.pageid);
                          } else {
                            WikiPageNotFound("");
                            return null;
                          }
                        })

                        // Caught error for list, call routine to display Wiki List Not Found.
                        .catch(function (error) {
                          WikiPageNotFound(error.message);
                          return null;
                        });
                    }
                  })

                  // Caught error for list, call routine to display Wiki List Not Found.
                  .catch(function (error) {
                    WikiPageNotFound(error.message);
                    return null;
                  });
              }
            })

            // Caught error for list, call routine to display Wiki List Not Found.
            .catch(function (error) {
              WikiPageNotFound(error.message);
              return null;
            });
        }
      })

      // Caught Wiki Page Content error, call routine to display Wiki Page Not Found.
      .catch(function (error) {
        WikiPageNotFound(error.message);
        return null;
      });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function: GetWikiData - This function will get the text from the top section of the page and a link to the page.
  //
  // PageId - The Id value for the page.
  // szCharacter - The character name that the user typed in.
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function GetWikiData(PageId) {
    let nIndex = 0;
    let szLinkName = "";
    let szLinkUrl = "";
    let nItems = 0;
    let requestUrl = "";
    let content_response = null;
    let content_data = null;
    let list_response = null;
    let list_data = null;
    let szSearch = "";

    ////////////////////////////////////////////////////////////////////////////////////////
    // Using query action to get the top section of the page.  Passing in the PageId value.
    ////////////////////////////////////////////////////////////////////////////////////////
    requestUrl =
      "https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=extracts&exintro&explaintext&redirects=1&format=json&pageids=" +
      PageId;

    // Replace any space character with the text string "%20".
    requestUrl = requestUrl.replace(/ /gi, "%20");

    fetch(requestUrl)
      // Get the content response.
      .then(function (content_response) {
        if (content_response.ok) {
          return content_response.json();
        } else {
          // If the response was not ok, then throw an error.
          throw new Error(content_response.status);
        }
      })

      // Get the content data.
      .then(function (content_data) {
        // Search the text for "comic", if not found then call function to display wiki page not found.
        if (
          content_data.query.pages[PageId].extract
            .toLowerCase()
            .search("comic") == -1
        ) {
          WikiPageNotFound("");
          return;
        }

        // Update the Wiki Paragraph Title Text with the Character Name entered by the user.  Get and display the Paragraph Text.
        //paragraphTitle.innerHTML = szCharacter;
        wikiParagraph.innerHTML = content_data.query.pages[PageId].extract;

        // Set the search string to the title of the page so we will find this link.
        szSearch = content_data.query.pages[PageId].title;

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Using opensearch action - Getting list of link names and url's.
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        requestUrl =
          "https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=" +
          szSearch;

        // Replace any space character with the text string "%20".
        requestUrl = requestUrl.replace(/ /gi, "%20");

        fetch(requestUrl)
          // Get the list response.
          .then(function (list_response) {
            if (list_response.ok) {
              return list_response.json();
            } else {
              // if list response not ok, then throw an error.
              throw new Error(list_response.status);
            }
          })

          // Get the list data.
          .then(function (list_data) {
            // Remove the all the attributes for the wiki link so initially not displayed.
            wikiLink.removeAttribute("href");
            wikiLink.removeAttribute("target");
            wikiLink.innerHTML = "";

            if (list_data.length > 0) {
              // Add list items.
              if (list_data.length >= 3) {
                nItems = list_data[1].length;

                if (nItems > 0) {
                  // Loop through the list items.
                  for (nIndex = 0; nIndex < nItems; nIndex++) {
                    szLinkName = list_data[1][nIndex];
                    szLinkUrl = list_data[3][nIndex];

                    // Find the link that matches the title of the page.
                    // This is the only one we want to display.
                    // Add attributes and text so anchor element will be visible.
                    if (szLinkName.toLowerCase() === szSearch.toLowerCase()) {
                      wikiLink.setAttribute("href", szLinkUrl);
                      wikiLink.setAttribute("target", "_blank");
                      wikiLink.classList.add("wikibutton");
                      wikiLink.innerHTML = "Wikipedia link: " + szLinkName;
                    }
                  }
                }
              }
            }
          })

          // Caught error for list, call routine to display Wiki List Not Found.
          .catch(function (error) {
            WikiListNotFound();
            return null;
          });
      })

      // Caught Wiki Page Content error, call routine to display Wiki Page Not Found.
      .catch(function (error) {
        WikiPageNotFound(error.message);
        return null;
      });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function: WikiPageNotFound:
  // szMessage: String that contains an error message, maybe an empty string.
  //
  // This function will display the message the the Wiki Page Was Not Found in the Wiki page paragraph element.
  // It will also display the error message if one is passed into this routine.
  // It will remove all of the attributes and text from the anchor element so it is not visible.
  //
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function WikiPageNotFound(szMessage) {
    let szTemp = "";

    // Add the Character name and message to the paragraph.
    szTemp = "Wikipedia Page Not Found.";

    if (szMessage.length != 0) {
      szTemp += "<br><br>The following problem occurred:<br>" + szMessage;
    }
    wikiParagraph.innerHTML = szTemp;

    // Remove the all the attributes for the wiki link.
    wikiLink.removeAttribute("href");
    wikiLink.removeAttribute("target");
    wikiLink.innerHTML = "";
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function: WikiListNotFound:
  //
  // This function will remove all of the attributes and the text so the anchor element is not visible.
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function WikiListNotFound() {
    // Remove the all the attributes for the wiki link.
    wikiLink.removeAttribute("href");
    wikiLink.removeAttribute("target");
    wikiLink.innerHTML = "";
  }

  // SECTION END: End of Wikipedia Code : //////////////////////////////////////////////////////////////////////////////////////////////////

  function renderHistory() {
    searchHistory.innerHTML = "";
    history.splice(5);
    saveHistory();
    for (i = 0; i < history.length; i++) {
      const historyButton = document.createElement("button");
      historyButton.classList.add(
        "bg-red-500",
        "hover:bg-red-700",
        "text-white",
        "font-bold",
        "py-2",
        "px-4",
        "rounded"
      );
      historyButton.textContent = history[i];
      historyButton.addEventListener("click", function (e) {
        e.preventDefault();

        const searchInput = historyButton.textContent;
        getHash(searchInput);

        // Added call to get WikiPageID
        getWikiPageID(searchInput);
      });
      searchHistory.append(historyButton);
    }
  }

  function saveHistory() {
    localStorage.setItem("history", JSON.stringify(history));
  }

  function init() {
    var storedHistory = JSON.parse(localStorage.getItem("history"));

    if (storedHistory !== null) {
      history = storedHistory;
    }
    renderHistory(storedHistory);
    saveHistory();
  }

  init();
});
