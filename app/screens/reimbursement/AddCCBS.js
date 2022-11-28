import { useEffect, useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Text, ScrollView, Alert, Image } from "react-native";
import { AuthContext } from "../../data/Auth-Context";
import { URL } from "../../utilities/UrlBase";
import { CustomColors } from "../../utilities/CustomColors";
import ExpenseDeleteDialog from "../../components/dialog/ExpenseDeleteDialog";
import SubmitButton from "../../components/ui/SubmitButton";
import CommentBox from "../../components/ui/CommentBox";
import { FontAwesome } from "@expo/vector-icons";
import CCBSSummaryCard from "../../components/cards/CCBSSummaryCard";
import AlertCredentialError from "../../components/toast/AlertCredentialError";
import ToastMessage from "../../components/toast/ToastMessage";

export default function AddCCBS({ route }) {
  const navigation = useNavigation();
  const FromDate = route.params.FromDate;
  const ToDate = route.params.ToDate;
  const ReqDate = route.params.ReqDate;
  const claimamount = route.params.claimamount;
  const empid = route.params.empid;
  const onbehalf = route.params.onbehalf;
  const [getccbslist, setccbslist] = useState([]);
  const [addccbs, setaddccbs] = useState(true);
  const [totalgiven, settotalgiven] = useState(0);
  const [deletedialogstatus, setdeletedialogstatus] = useState(false);
  const [deleteid, setdeletid] = useState("");
  const [remarks, setremarks] = useState(route.params.makercomment);
  const [progressBar, setProgressBar] = useState(false);
  const [TourId, setTourId] = useState(route.params.TourId);
  const authCtx = useContext(AuthContext);

  let totalgivenamount = 0;

  useEffect(() => {
    if (getccbslist.length > 0) {
      const update = getccbslist.filter(
        (item) => item.id == route.params.list[0].id
      );
      if (update.length > 0) {
        for (let i = 0; i < getccbslist.length; i++) {
          if (getccbslist[i].id == route.params.list[0].id) {
            getccbslist[i] = route.params.list[0];
            break;
          }
        }
      } else {
        if ("list" in route.params) {
          setccbslist([...getccbslist, ...route.params.list]);
        }
      }
    } else {
      if ("list" in route.params) {
        setccbslist([...getccbslist, ...route.params.list]);
      }
    }

    if ("claim_status_id" in route.params) {
      if (route.params.claim_status_id == 5) fromapi();
    }
  }, [route]);

  useEffect(() => {
    if (getccbslist.length > 0) {
      for (let i = 0; i < getccbslist.length; i++) {
        totalgivenamount =
          parseInt(totalgivenamount) + parseInt(getccbslist[i].getamount);
      }
    } else {
      totalgivenamount = 0;
    }
    settotalgiven(totalgivenamount);
  }, [route, getccbslist]);

  function deletemethod() {
    setdeletedialogstatus(!deletedialogstatus);
    const position = getccbslist.filter((item) => item.id != deleteid);
    setccbslist(position);
  }

  async function fromapi() {
    let ccbsarray = [];
    setProgressBar(true);

    try {
      const response = await fetch(URL.CCBS_GET + "type=2&tour=" + TourId, {
        headers: {
          "Content-Type": "application/json",
          Authorization: authCtx.auth_token,
        },
      });
      let json = await response.json();

      if ("detail" in json) {
        if(json.detail == "Invalid credentials/token."){
        AlertCredentialError(json.detail, navigation);
        }
      } else {
        for (let i = 0; i < json.length; i++) {
          const obj = {
            id: json[i].id,
            getamount: json[i].amount,
            percentage: json[i].percentage,
            bs: json[i].bs_data.name,
            cc: json[i].cc_data.name,
            claimamount: claimamount,
            bsid: json[i].bs_data.id,
            ccid: json[i].cc_data.id,
            tourgid: TourId,
            FromDate: FromDate,
            ToDate: ToDate,
            ReqDate: ReqDate,
          };
          ccbsarray.push(obj);
        }

        setccbslist(ccbsarray);
      }
      setProgressBar(false);
    } catch (error) {
      setProgressBar(false);
    } finally {
    }
  }

  useEffect(() => {
    navigation.setOptions({
      title: "Expenses",
    });
  }, []);
  function validation() {
    if (totalgiven == claimamount) {
      if (remarks != "") {
        if (getccbslist.length != 0) {
          ccbspost();
        } else {
          Alert.alert("Enter a valid CCBS");
        }
      } else {
        Alert.alert("Comments can't be empty");
      }
    } else {
      Alert.alert("Enter a valid Expense Amount");
    }
  }
  async function ccbspost() {
    setProgressBar(true);
    let obj;
    let ccbsobj;
    let ccbjarray = [];
    const data = new FormData();

    for (let i = 0; i < getccbslist.length; i++) {
      ccbsobj = {
        bsid: getccbslist[i].bsid,
        ccid: getccbslist[i].ccid,
        amount: getccbslist[i].getamount,
        tourgid: TourId,
        percentage: getccbslist[i].percentage,
      };
      ccbjarray.push(ccbsobj);
    }

    obj = {
      tourgid: TourId,
      appcomment: remarks,
      ccbs: ccbjarray,
    };
    if (onbehalf) {
      obj["onbehalfof"] = empid;
    }

    data.append("data", JSON.stringify(obj));

    try {
      const response = await fetch(URL.EXPENSE_SUBMIT, {
        method: "POST",
        body: data,
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: authCtx.auth_token,
        },
      });

      let json = await response.json();

      if (json) {
        if ("detail" in json) {
          if(json.detail == "Invalid credentials/token."){
          AlertCredentialError(json.detail, navigation);
          }
        }
        setProgressBar(false);
        if (json.message) {
          ToastMessage(json.message);
          // Alert.alert(json.message);
          navigation.goBack();
          navigation.goBack();
          navigation.goBack();
          //   navigation.navigate("ReimbursementScreen");
        } else {
          Alert.alert(json.description);
        }
      }
    } catch (error) {}
  }

  return (
    <View style={styles.view}>
      <View style={styles.safeAreaView}>
        {progressBar ? (
          <View
            style={{
              flex: 1,
              backgroundColor: CustomColors.screen_background_gray,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View>
              <Image
                style={{ width: 100, height: 100 }}
                source={require("../../assets/icons/Progressbar2.gif")}
              />
            </View>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            bounces={false}
          >
            <View style={styles.maincontainer}>
              <View style={styles.row}>
                <Text style={styles.text}>Travel No: {TourId}</Text>
                <Text style={styles.text}>{FromDate}</Text>
                <Text style={styles.text}>{ToDate}</Text>
              </View>
            </View>
            <CommentBox
              label=""
              inputComment={remarks}
              hint="Comments*"
              onInputCommentChanged={(updated) => {
                setremarks(updated);
              }}
            ></CommentBox>
            {deletedialogstatus && (
              <ExpenseDeleteDialog
                dialogstatus={deletedialogstatus}
                Tittle=""
                setdialogstatus={setdeletedialogstatus}
                deletemethod={deletemethod}
              ></ExpenseDeleteDialog>
            )}
            <View style={styles.ccbs}>
              <Text style={styles.ccbstext}>Add CCBS:</Text>
              {totalgiven < claimamount && (
                <FontAwesome
                  name="plus"
                  size={24}
                  color="#FFBB4F"
                  onPress={() => {
                    navigation.navigate("ExpenseAddCCBS", {
                      claimamount: claimamount,
                      TourId: TourId,
                      FromDate: FromDate,
                      ToDate: ToDate,
                      ReqDate: ReqDate,
                      empid: empid,
                      onbehalf: onbehalf,
                    });
                  }}
                />
              )}
            </View>
            {getccbslist.length != 0 && (
              <CCBSSummaryCard
                data={getccbslist}
                setdeletid={setdeletid}
                setdeletedialogstatus={setdeletedialogstatus}
              ></CCBSSummaryCard>
            )}
          </ScrollView>
        )}
        {!progressBar && (
          <View>
            <SubmitButton onPressEvent={validation}>CONFIRM</SubmitButton>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noDataFoundText: {
    marginTop: 50,
    fontSize: 14,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  safeAreaView: {
    flex: 1,
    marginLeft: "4%",
    marginRight: "4%",
    marginBottom: "3%",
    marginTop: "3%",
  },
  view: {
    flex: 1,
    backgroundColor: CustomColors.screen_background_gray,
  },
  maincontainer: {
    top: 5,
    bottom: 10,
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    padding: 2,
    marginHorizontal: 20,
    justifyContent: "space-between",
  },
  ccbs: {
    flexDirection: "row",
    padding: 2,
    bottom: 10,

    justifyContent: "space-between",
  },
  text: {
    fontWeight: "normal",
    color: "black",
    fontSize: 12,
  },
  ccbstext: {
    fontWeight: "bold",
    color: CustomColors.color_green,
    fontSize: 15,
  },
  button: {
    alignContent: "flex-end",
    bottom: 20,
    top: 5,
  },
});
